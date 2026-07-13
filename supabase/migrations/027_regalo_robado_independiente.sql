-- 027_regalo_robado_independiente.sql
-- Regalo Robado becomes independent from assignment/wishlist/gift-ownership flows.

alter table public.eventos
  add column status text not null default 'registro_abierto'
    check (status in ('registro_abierto', 'ruleta_activa'));

create table public.regalo_robado_compras (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'comprado')),
  comprado_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evento_id, usuario_id)
);

create table public.regalo_robado_turnos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  orden int not null check (orden >= 0),
  created_at timestamptz not null default now(),
  unique (evento_id, usuario_id),
  unique (evento_id, orden)
);

create index idx_regalo_robado_compras_evento on public.regalo_robado_compras(evento_id);
create index idx_regalo_robado_turnos_evento on public.regalo_robado_turnos(evento_id, orden);

alter table public.regalo_robado_compras enable row level security;
alter table public.regalo_robado_turnos enable row level security;

create trigger regalo_robado_compras_set_updated_at
  before update on public.regalo_robado_compras
  for each row execute function public.set_updated_at();

create policy "regalo_robado_compras: member select" on public.regalo_robado_compras
  for select using (public.is_event_member(evento_id));

create policy "regalo_robado_compras: owner insert" on public.regalo_robado_compras
  for insert with check (
    usuario_id = auth.uid()
    and exists (
      select 1 from public.eventos e
      where e.id = evento_id and e.modo = 'regalo_robado' and e.estado = 'activo'
    )
    and public.is_event_member(evento_id)
  );

create policy "regalo_robado_compras: owner update" on public.regalo_robado_compras
  for update using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy "regalo_robado_turnos: member select" on public.regalo_robado_turnos
  for select using (public.is_event_member(evento_id));

revoke all on public.regalo_robado_compras from public, anon, authenticated;
revoke all on public.regalo_robado_turnos from public, anon, authenticated;
grant select, insert, update on public.regalo_robado_compras to authenticated;
grant select on public.regalo_robado_turnos to authenticated;

create or replace function public.listar_estado_compras_regalo_robado(p_evento_id uuid)
returns table(
  id uuid,
  evento_id uuid,
  usuario_id uuid,
  usuario_nombre text,
  estado text,
  comprado_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not public.is_event_member(p_evento_id) then raise exception 'no tienes acceso a este evento'; end if;

  insert into public.regalo_robado_compras (evento_id, usuario_id)
  select p.evento_id, p.usuario_id
  from public.participantes p
  join public.eventos e on e.id = p.evento_id
  where p.evento_id = p_evento_id
    and e.modo = 'regalo_robado'
    and p.estado = 'confirmado'
  on conflict (evento_id, usuario_id) do nothing;

  return query
    select
      c.id,
      c.evento_id,
      c.usuario_id,
      u.nombre as usuario_nombre,
      c.estado,
      c.comprado_at,
      c.created_at,
      c.updated_at
    from public.regalo_robado_compras c
    join public.usuarios u on u.id = c.usuario_id
    where c.evento_id = p_evento_id
    order by u.nombre;
end;
$$;

create or replace function public.actualizar_mi_estado_compra_regalo_robado(
  p_evento_id uuid,
  p_estado text
)
returns public.regalo_robado_compras
language plpgsql security definer set search_path = public as $$
declare
  v_row public.regalo_robado_compras;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_estado not in ('pendiente', 'comprado') then raise exception 'estado inválido'; end if;
  if not public.is_event_member(p_evento_id) then raise exception 'no tienes acceso a este evento'; end if;
  if not exists (select 1 from public.eventos where id = p_evento_id and modo = 'regalo_robado') then
    raise exception 'este evento no es Regalo Robado';
  end if;

  insert into public.regalo_robado_compras (evento_id, usuario_id, estado, comprado_at)
  values (p_evento_id, auth.uid(), p_estado, case when p_estado = 'comprado' then now() else null end)
  on conflict (evento_id, usuario_id)
  do update set
    estado = excluded.estado,
    comprado_at = case when excluded.estado = 'comprado' then coalesce(regalo_robado_compras.comprado_at, now()) else null end
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.activar_intercambio_regalo_robado(p_evento_id uuid)
returns public.eventos
language plpgsql security definer set search_path = public as $$
declare
  v_evento public.eventos;
  v_participantes_count int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select * into v_evento from public.eventos where id = p_evento_id;
  if v_evento.id is null then raise exception 'evento no encontrado'; end if;
  if v_evento.modo <> 'regalo_robado' then raise exception 'este evento no es Regalo Robado'; end if;
  if v_evento.admin_id <> auth.uid() then raise exception 'solo el admin puede activar el intercambio'; end if;
  if v_evento.status = 'ruleta_activa' then raise exception 'el intercambio ya está activo'; end if;

  select count(*)::int into v_participantes_count
  from public.participantes
  where evento_id = p_evento_id and estado = 'confirmado';

  if v_participantes_count < 3 then
    raise exception 'necesitas al menos 3 participantes para activar el intercambio';
  end if;

  insert into public.regalo_robado_compras (evento_id, usuario_id)
  select evento_id, usuario_id
  from public.participantes
  where evento_id = p_evento_id and estado = 'confirmado'
  on conflict (evento_id, usuario_id) do nothing;

  insert into public.regalo_robado_turnos (evento_id, usuario_id, orden)
  select p_evento_id, usuario_id, row_number() over (order by random())::int - 1
  from public.participantes
  where evento_id = p_evento_id and estado = 'confirmado'
  on conflict (evento_id, usuario_id) do nothing;

  update public.eventos
  set status = 'ruleta_activa',
      juego_iniciado_at = coalesce(juego_iniciado_at, now()),
      turno_actual = 0
  where id = p_evento_id
  returning * into v_evento;

  return v_evento;
end;
$$;

create or replace function public.girar_ruleta(p_evento_id uuid)
returns table(numero_turno int, numero_ruleta int)
language plpgsql security definer set search_path = public as $$
declare
  v_evento public.eventos;
  v_turno_participante uuid;
  v_participantes_count int;
  v_roll int;
  v_numero_turno int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select * into v_evento from public.eventos where id = p_evento_id;
  if v_evento.id is null then raise exception 'evento no encontrado'; end if;
  if v_evento.modo <> 'regalo_robado' or v_evento.status <> 'ruleta_activa' or v_evento.estado = 'completado' then
    raise exception 'el intercambio no está activo para este evento';
  end if;

  select count(*)::int into v_participantes_count
  from public.regalo_robado_turnos where evento_id = p_evento_id;
  if v_participantes_count = 0 then raise exception 'no hay turnos configurados'; end if;

  select usuario_id into v_turno_participante
  from public.regalo_robado_turnos
  where evento_id = p_evento_id
    and orden = (v_evento.turno_actual % v_participantes_count);

  if v_turno_participante <> auth.uid() then
    raise exception 'no es tu turno';
  end if;

  v_numero_turno := v_evento.turno_actual + 1;

  if exists (
    select 1 from public.turnos_ruleta
    where evento_id = p_evento_id and numero_turno = v_numero_turno and accion = 'pendiente'
  ) then
    raise exception 'este turno ya tiene un giro pendiente';
  end if;

  v_roll := floor(random() * 5)::int + 1;

  insert into public.turnos_ruleta (evento_id, numero_turno, participante_id, numero_ruleta, accion, detalles)
  values (p_evento_id, v_numero_turno, auth.uid(), v_roll, 'pendiente', '{}');

  return query select v_numero_turno, v_roll;
end;
$$;

create or replace function public.resolver_turno_ruleta(
  p_evento_id uuid,
  p_numero_turno int,
  p_objetivo_ids uuid[] default null
)
returns public.turnos_ruleta
language plpgsql security definer set search_path = public as $$
declare
  v_turno public.turnos_ruleta;
  v_accion text;
  v_count int;
  v_expected_count int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select * into v_turno from public.turnos_ruleta
  where evento_id = p_evento_id and numero_turno = p_numero_turno;

  if v_turno.id is null then raise exception 'turno no encontrado'; end if;
  if v_turno.participante_id <> auth.uid() then raise exception 'este turno no te pertenece'; end if;
  if v_turno.accion <> 'pendiente' then raise exception 'este turno ya fue resuelto'; end if;

  v_count := coalesce(array_length(p_objetivo_ids, 1), 0);

  if v_turno.numero_ruleta = 1 then
    v_accion := 'girar_derecha';
    v_expected_count := 0;
  elsif v_turno.numero_ruleta = 2 then
    v_accion := 'girar_izquierda';
    v_expected_count := 0;
  elsif v_turno.numero_ruleta = 3 then
    v_accion := 'intercambiar';
    v_expected_count := 1;
  elsif v_turno.numero_ruleta = 4 then
    v_accion := 'elegir_2';
    v_expected_count := 2;
  elsif v_turno.numero_ruleta = 5 then
    v_accion := 'cambios_multiples';
    if v_count < 3 then raise exception 'este resultado requiere elegir 3 o más personas'; end if;
    v_expected_count := v_count;
  else
    raise exception 'número de ruleta inválido';
  end if;

  if v_turno.numero_ruleta in (1, 2) and v_count <> 0 then
    raise exception 'este resultado no requiere elegir personas';
  end if;

  if v_turno.numero_ruleta in (3, 4) and v_count <> v_expected_count then
    raise exception 'cantidad de personas inválida para este resultado';
  end if;

  if p_objetivo_ids is not null and exists (
    select 1
    from unnest(p_objetivo_ids) objetivo_id
    where not exists (
      select 1 from public.participantes p
      where p.evento_id = p_evento_id and p.usuario_id = objetivo_id and p.estado = 'confirmado'
    )
  ) then
    raise exception 'todas las personas elegidas deben pertenecer al evento';
  end if;

  update public.turnos_ruleta
  set accion = v_accion,
      detalles = jsonb_build_object(
        'objetivo_ids', coalesce(to_jsonb(p_objetivo_ids), '[]'::jsonb),
        'instruccion', 'Realiza esta acción con los regalos físicos en la reunión.'
      )
  where id = v_turno.id
  returning * into v_turno;

  update public.eventos
  set turno_actual = p_numero_turno
  where id = p_evento_id;

  return v_turno;
end;
$$;

revoke execute on function public.listar_estado_compras_regalo_robado(uuid) from public, anon;
revoke execute on function public.actualizar_mi_estado_compra_regalo_robado(uuid, text) from public, anon;
revoke execute on function public.activar_intercambio_regalo_robado(uuid) from public, anon;
revoke execute on function public.girar_ruleta(uuid) from public, anon;
revoke execute on function public.resolver_turno_ruleta(uuid, int, uuid[]) from public, anon;

grant execute on function public.listar_estado_compras_regalo_robado(uuid) to authenticated;
grant execute on function public.actualizar_mi_estado_compra_regalo_robado(uuid, text) to authenticated;
grant execute on function public.activar_intercambio_regalo_robado(uuid) to authenticated;
grant execute on function public.girar_ruleta(uuid) to authenticated;
grant execute on function public.resolver_turno_ruleta(uuid, int, uuid[]) to authenticated;
