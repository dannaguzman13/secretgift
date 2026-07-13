-- 012_sorteo_real.sql
-- Pivot from "colecta" (single fixed receptor) to real sorteo (Secret Santa: 1-to-1 random assignment).

-- 1. Drop functions/policies that reference things about to disappear.
drop function if exists public.claim_receptor(uuid);
drop function if exists public.get_event_preview_by_token(uuid);
drop policy if exists "preferencias: only receptor inserts" on public.preferencias;
drop policy if exists "preferencias: only receptor updates" on public.preferencias;

-- 2. preferencias: one wishlist per participant, not one per event.
truncate table public.preferencias;
alter table public.preferencias add column usuario_id uuid not null references public.usuarios(id) on delete cascade;
alter table public.preferencias drop constraint preferencias_pkey;
alter table public.preferencias add primary key (evento_id, usuario_id);

create policy "preferencias: own row insert" on public.preferencias
  for insert with check (usuario_id = (select auth.uid()) and public.is_event_member(evento_id));
create policy "preferencias: own row update" on public.preferencias
  for update using (usuario_id = (select auth.uid()) and public.is_event_member(evento_id));

-- 3. participantes: single uniform role.
alter table public.participantes drop constraint participantes_rol_check;
update public.participantes set rol = 'participante' where rol <> 'participante';
alter table public.participantes add constraint participantes_rol_check check (rol in ('participante'));

-- 4. asignaciones: add receptor_id (target), enforce a valid permutation.
truncate table public.asignaciones;
alter table public.asignaciones add column receptor_id uuid not null references public.usuarios(id) on delete cascade;
alter table public.asignaciones add constraint asignaciones_evento_id_receptor_id_key unique (evento_id, receptor_id);

-- 5. eventos: drop single-receptor columns, add sorteo tracking.
alter table public.eventos
  drop column receptor_id,
  drop column receptor_nombre,
  drop column receptor_email;
alter table public.eventos add column sorteo_realizado_at timestamptz null;

-- 6. eventos_receptor_tokens no longer needed.
drop table public.eventos_receptor_tokens;

-- 7. get_event_preview_by_code now also reports whether the sorteo already ran.
drop function if exists public.get_event_preview_by_code(text);
create function public.get_event_preview_by_code(p_codigo text)
returns table(id uuid, nombre text, presupuesto numeric, fecha_compra date, estado text, sorteo_realizado_at timestamptz)
language sql stable security definer set search_path = public as $$
  select id, nombre, presupuesto, fecha_compra, estado, sorteo_realizado_at from public.eventos
  where codigo_acceso = upper(p_codigo);
$$;

revoke execute on function public.get_event_preview_by_code(text) from public;
grant execute on function public.get_event_preview_by_code(text) to anon, authenticated;

-- 8. join_event_by_code: block joins after the sorteo, no longer creates asignaciones rows.
create or replace function public.join_event_by_code(p_codigo text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_evento_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into v_evento_id from public.eventos where codigo_acceso = upper(p_codigo) and estado = 'activo';
  if v_evento_id is null then raise exception 'invalid or inactive code'; end if;

  if exists (select 1 from public.eventos where id = v_evento_id and sorteo_realizado_at is not null) then
    raise exception 'sorteo ya realizado';
  end if;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento_id, auth.uid(), 'participante', 'confirmado')
  on conflict (evento_id, usuario_id) do nothing;

  return v_evento_id;
end;
$$;

-- 9. realizar_sorteo: generates a derangement (no self-assignment) and locks the event.
create or replace function public.realizar_sorteo(p_evento_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_ids uuid[];
  v_shuffled uuid[];
  v_valid boolean := false;
  v_attempts int := 0;
begin
  if (select auth.uid()) <> (select admin_id from public.eventos where id = p_evento_id) then
    raise exception 'solo el admin puede realizar el sorteo';
  end if;

  if not exists (select 1 from public.eventos where id = p_evento_id and estado = 'activo' and sorteo_realizado_at is null) then
    raise exception 'el evento no está en estado válido para sortear';
  end if;

  if (select count(*) from public.participantes where evento_id = p_evento_id) < 3 then
    raise exception 'se necesitan al menos 3 participantes';
  end if;

  select array_agg(usuario_id order by usuario_id) into v_ids
  from public.participantes where evento_id = p_evento_id;

  while not v_valid and v_attempts < 50 loop
    select array_agg(x order by random()) into v_shuffled from unnest(v_ids) as x;
    v_valid := not exists (
      select 1 from generate_subscripts(v_ids, 1) i
      where v_ids[i] = v_shuffled[i]
    );
    v_attempts := v_attempts + 1;
  end loop;

  if not v_valid then
    raise exception 'no se pudo generar un sorteo válido, intenta de nuevo';
  end if;

  insert into public.asignaciones (evento_id, comprador_id, receptor_id)
  select p_evento_id, v_ids[i], v_shuffled[i]
  from generate_subscripts(v_ids, 1) i;

  update public.eventos set sorteo_realizado_at = now() where id = p_evento_id;
end;
$$;

revoke execute on function public.realizar_sorteo(uuid) from public, anon;
grant execute on function public.realizar_sorteo(uuid) to authenticated;
