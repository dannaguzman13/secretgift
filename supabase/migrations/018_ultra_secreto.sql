-- 018_ultra_secreto.sql
-- Ultra Secreto: hidden identities via per-event aliases drawn from a themed universe.

create table public.aliases (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  universo text not null,
  alias text not null,
  alias_index int not null,
  created_at timestamptz not null default now(),
  unique (evento_id, usuario_id),
  unique (evento_id, alias_index)
);

alter table public.aliases enable row level security;

create policy "aliases: member select" on public.aliases
  for select using (public.is_event_member(evento_id));

revoke all on public.aliases from public, anon, authenticated;
grant select on public.aliases to authenticated;

-- realizar_sorteo_ultra_secreto: same derangement as realizar_sorteo, plus alias
-- assignment (join order -> alias index) and a 20-participant cap.
create function public.realizar_sorteo_ultra_secreto(p_evento_id uuid, p_aliases text[])
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_ids uuid[];
  v_shuffled uuid[];
  v_joined_ids uuid[];
  v_valid boolean := false;
  v_attempts int := 0;
  v_universo text;
  v_count int;
begin
  if (select auth.uid()) <> (select admin_id from public.eventos where id = p_evento_id) then
    raise exception 'solo el admin puede realizar el sorteo';
  end if;

  select universo into v_universo from public.eventos where id = p_evento_id;

  if not exists (select 1 from public.eventos where id = p_evento_id and modo = 'ultra_secreto') then
    raise exception 'este evento no es Ultra Secreto';
  end if;

  if not exists (select 1 from public.eventos where id = p_evento_id and estado = 'activo' and sorteo_realizado_at is null) then
    raise exception 'el evento no está en estado válido para sortear';
  end if;

  select count(*) into v_count from public.participantes where evento_id = p_evento_id;
  if v_count < 3 then
    raise exception 'se necesitan al menos 3 participantes';
  end if;
  if v_count > 20 then
    raise exception 'ultra secreto admite máximo 20 participantes';
  end if;
  if array_length(p_aliases, 1) < v_count then
    raise exception 'no hay suficientes aliases para la cantidad de participantes';
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

  select array_agg(usuario_id order by created_at) into v_joined_ids
  from public.participantes where evento_id = p_evento_id;

  insert into public.aliases (evento_id, usuario_id, universo, alias, alias_index)
  select p_evento_id, v_joined_ids[i], v_universo, p_aliases[i], i
  from generate_subscripts(v_joined_ids, 1) i;

  update public.eventos set sorteo_realizado_at = now() where id = p_evento_id;
end;
$$;

revoke execute on function public.realizar_sorteo_ultra_secreto(uuid, text[]) from public, anon;
grant execute on function public.realizar_sorteo_ultra_secreto(uuid, text[]) to authenticated;

-- listar_estado_compras: show the buyer's alias instead of their real name while
-- an Ultra Secreto event hasn't been revealed (estado <> 'completado').
create or replace function public.listar_estado_compras(p_evento_id uuid)
returns table(id uuid, comprador_id uuid, estado text, comprado_at timestamptz, comprador_nombre text)
language sql stable security definer set search_path = public as $$
  select
    a.id, a.comprador_id, a.estado, a.comprado_at,
    case
      when e.modo = 'ultra_secreto' and e.estado <> 'completado' then coalesce(al.alias, u.nombre)
      else u.nombre
    end as comprador_nombre
  from public.asignaciones a
  join public.usuarios u on u.id = a.comprador_id
  join public.eventos e on e.id = a.evento_id
  left join public.aliases al on al.evento_id = a.evento_id and al.usuario_id = a.comprador_id
  where a.evento_id = p_evento_id
    and public.is_event_member(p_evento_id);
$$;
