-- 017_modos_evento.sql
-- Adds game-mode selection to eventos: amigo_secreto (default) | ultra_secreto | regalo_robado.

alter table public.eventos
  add column modo text not null default 'amigo_secreto'
    check (modo in ('amigo_secreto', 'ultra_secreto', 'regalo_robado'));

alter table public.eventos
  add column universo text null
    check (universo in (
      'marvel', 'disney', 'pokemon', 'star_wars', 'harry_potter',
      'mitologia', 'animales', 'flores', 'planetas', 'piedras_preciosas'
    ));

alter table public.eventos
  add constraint eventos_universo_solo_ultra_secreto check (
    (modo = 'ultra_secreto' and universo is not null) or
    (modo <> 'ultra_secreto' and universo is null)
  );

-- crear_evento_con_admin: accept modo/universo (defaults keep old callers working).
-- Drop the old 5-arg signature first: `create or replace` with a different
-- parameter list creates an overload instead of replacing it.
drop function if exists public.crear_evento_con_admin(text, numeric, date, date, text);
create or replace function public.crear_evento_con_admin(
  p_nombre text,
  p_presupuesto numeric,
  p_fecha_compra date,
  p_fecha_revelacion date,
  p_codigo_acceso text,
  p_modo text default 'amigo_secreto',
  p_universo text default null
)
returns public.eventos
language plpgsql security definer set search_path = public as $$
declare
  v_evento public.eventos;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  if not exists (select 1 from public.usuarios where id = auth.uid()) then
    raise exception 'tu cuenta no completó el registro correctamente, cierra sesión y vuelve a iniciarla';
  end if;

  insert into public.eventos (admin_id, nombre, presupuesto, fecha_compra, fecha_revelacion, codigo_acceso, modo, universo)
  values (auth.uid(), p_nombre, p_presupuesto, p_fecha_compra, p_fecha_revelacion, p_codigo_acceso, p_modo, p_universo)
  returning * into v_evento;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento.id, auth.uid(), 'participante', 'confirmado');

  return v_evento;
end;
$$;

-- get_event_preview_by_code: expose modo/universo/participantes_count so JoinBuyerPage
-- can warn about a full Ultra Secreto event before attempting to join.
drop function if exists public.get_event_preview_by_code(text);
create function public.get_event_preview_by_code(p_codigo text)
returns table(
  id uuid,
  nombre text,
  presupuesto numeric,
  fecha_compra date,
  estado text,
  sorteo_realizado_at timestamptz,
  modo text,
  universo text,
  participantes_count int
)
language sql stable security definer set search_path = public as $$
  select
    e.id, e.nombre, e.presupuesto, e.fecha_compra, e.estado, e.sorteo_realizado_at,
    e.modo, e.universo,
    (select count(*)::int from public.participantes p where p.evento_id = e.id)
  from public.eventos e
  where e.codigo_acceso = upper(p_codigo);
$$;

revoke execute on function public.get_event_preview_by_code(text) from public;
grant execute on function public.get_event_preview_by_code(text) to anon, authenticated;

-- join_event_by_code: block joins once an Ultra Secreto event has 20 participants.
create or replace function public.join_event_by_code(p_codigo text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_evento_id uuid;
declare v_modo text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  if not exists (select 1 from public.usuarios where id = auth.uid()) then
    raise exception 'tu cuenta no completó el registro correctamente, cierra sesión y vuelve a iniciarla';
  end if;

  select id, modo into v_evento_id, v_modo from public.eventos where codigo_acceso = upper(p_codigo) and estado = 'activo';
  if v_evento_id is null then raise exception 'invalid or inactive code'; end if;

  if exists (select 1 from public.eventos where id = v_evento_id and sorteo_realizado_at is not null) then
    raise exception 'sorteo ya realizado';
  end if;

  if v_modo = 'ultra_secreto' and (select count(*) from public.participantes where evento_id = v_evento_id) >= 20 then
    raise exception 'este evento ya alcanzó el máximo de 20 participantes';
  end if;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento_id, auth.uid(), 'participante', 'confirmado')
  on conflict (evento_id, usuario_id) do nothing;

  return v_evento_id;
end;
$$;
