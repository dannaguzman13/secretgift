-- 019_regalo_robado.sql
-- Regalo Robado: turn-based white-elephant style game played after the base sorteo.

alter table public.eventos add column juego_iniciado_at timestamptz null;
alter table public.eventos add column turno_actual int not null default 0;

create table public.estado_regalos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  regalo_numero int not null,
  comprador_original_id uuid not null references public.usuarios(id) on delete cascade,
  dueno_actual_id uuid not null references public.usuarios(id) on delete cascade,
  updated_at timestamptz not null default now(),
  unique (evento_id, regalo_numero)
);

create table public.turnos_ruleta (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  numero_turno int not null,
  participante_id uuid not null references public.usuarios(id) on delete cascade,
  numero_ruleta int not null check (numero_ruleta between 1 and 5),
  accion text not null,
  detalles jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (evento_id, numero_turno)
);

alter table public.estado_regalos enable row level security;
alter table public.turnos_ruleta enable row level security;

create policy "estado_regalos: member select" on public.estado_regalos
  for select using (public.is_event_member(evento_id));
create policy "turnos_ruleta: member select" on public.turnos_ruleta
  for select using (public.is_event_member(evento_id));

revoke all on public.estado_regalos from public, anon, authenticated;
revoke all on public.turnos_ruleta from public, anon, authenticated;
grant select on public.estado_regalos to authenticated;
grant select on public.turnos_ruleta to authenticated;

-- iniciar_juego_regalo_robado: admin-only, seeds estado_regalos 1:1 from asignaciones.
create function public.iniciar_juego_regalo_robado(p_evento_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if (select auth.uid()) <> (select admin_id from public.eventos where id = p_evento_id) then
    raise exception 'solo el admin puede iniciar el juego';
  end if;

  if not exists (select 1 from public.eventos where id = p_evento_id and modo = 'regalo_robado') then
    raise exception 'este evento no es Regalo Robado';
  end if;

  if not exists (select 1 from public.eventos where id = p_evento_id and sorteo_realizado_at is not null) then
    raise exception 'primero hay que realizar el sorteo';
  end if;

  if exists (select 1 from public.eventos where id = p_evento_id and juego_iniciado_at is not null) then
    raise exception 'el juego ya fue iniciado';
  end if;

  insert into public.estado_regalos (evento_id, regalo_numero, comprador_original_id, dueno_actual_id)
  select p_evento_id, row_number() over (order by comprador_id), comprador_id, receptor_id
  from public.asignaciones
  where evento_id = p_evento_id;

  update public.eventos set juego_iniciado_at = now(), turno_actual = 0 where id = p_evento_id;
end;
$$;

revoke execute on function public.iniciar_juego_regalo_robado(uuid) from public, anon;
grant execute on function public.iniciar_juego_regalo_robado(uuid) to authenticated;

-- girar_ruleta: rolls 1-5 for the participant whose turn it is, logs a pending turn.
-- Turn order = participantes ordered by created_at, cycling via turno_actual % count.
create function public.girar_ruleta(p_evento_id uuid)
returns table(numero_turno int, numero_ruleta int)
language plpgsql security definer set search_path = public as $$
declare
  v_turno_actual int;
  v_ids uuid[];
  v_turno_participante uuid;
  v_roll int;
  v_numero_turno int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  if not exists (select 1 from public.eventos where id = p_evento_id and modo = 'regalo_robado' and juego_iniciado_at is not null and estado <> 'completado') then
    raise exception 'el juego no está activo para este evento';
  end if;

  select turno_actual into v_turno_actual from public.eventos where id = p_evento_id;

  select array_agg(usuario_id order by created_at) into v_ids
  from public.participantes where evento_id = p_evento_id;

  v_turno_participante := v_ids[(v_turno_actual % array_length(v_ids, 1)) + 1];

  if v_turno_participante <> auth.uid() then
    raise exception 'no es tu turno';
  end if;

  v_roll := floor(random() * 5)::int + 1;
  v_numero_turno := v_turno_actual + 1;

  insert into public.turnos_ruleta (evento_id, numero_turno, participante_id, numero_ruleta, accion, detalles)
  values (p_evento_id, v_numero_turno, auth.uid(), v_roll, 'pendiente', '{}');

  return query select v_numero_turno, v_roll;
end;
$$;

revoke execute on function public.girar_ruleta(uuid) from public, anon;
grant execute on function public.girar_ruleta(uuid) to authenticated;

-- resolver_turno_ruleta: applies the effect for a pending roll and advances the turn.
create function public.resolver_turno_ruleta(p_evento_id uuid, p_numero_turno int, p_objetivo_ids uuid[] default null)
returns public.turnos_ruleta
language plpgsql security definer set search_path = public as $$
declare
  v_turno public.turnos_ruleta;
  v_accion text;
  v_regalo_actual_participante int;
  v_regalo_objetivo int;
  v_subset_regalos int[];
  v_regalo_nums int[];
  v_duenos uuid[];
  v_snapshot_before jsonb;
  v_snapshot_after jsonb;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select * into v_turno from public.turnos_ruleta
  where evento_id = p_evento_id and numero_turno = p_numero_turno;

  if v_turno.id is null then
    raise exception 'turno no encontrado';
  end if;
  if v_turno.participante_id <> auth.uid() then
    raise exception 'este turno no te pertenece';
  end if;
  if v_turno.accion <> 'pendiente' then
    raise exception 'este turno ya fue resuelto';
  end if;

  select jsonb_agg(jsonb_build_object('regalo_numero', regalo_numero, 'dueno_actual_id', dueno_actual_id))
  into v_snapshot_before
  from public.estado_regalos where evento_id = p_evento_id;

  if v_turno.numero_ruleta = 1 then
    v_accion := 'girar_derecha';
    -- new_owner(regalo N) = old_owner(regalo N-1), wrapping new_owner(1) = old_owner(max).
    select array_agg(regalo_numero order by regalo_numero), array_agg(dueno_actual_id order by regalo_numero)
    into v_regalo_nums, v_duenos
    from public.estado_regalos where evento_id = p_evento_id;

    update public.estado_regalos e
    set dueno_actual_id = v_duenos[((i - 2 + array_length(v_duenos, 1)) % array_length(v_duenos, 1)) + 1], updated_at = now()
    from generate_subscripts(v_regalo_nums, 1) i
    where e.evento_id = p_evento_id and e.regalo_numero = v_regalo_nums[i];

  elsif v_turno.numero_ruleta = 2 then
    v_accion := 'girar_izquierda';
    -- new_owner(regalo N) = old_owner(regalo N+1), wrapping new_owner(max) = old_owner(1).
    select array_agg(regalo_numero order by regalo_numero), array_agg(dueno_actual_id order by regalo_numero)
    into v_regalo_nums, v_duenos
    from public.estado_regalos where evento_id = p_evento_id;

    update public.estado_regalos e
    set dueno_actual_id = v_duenos[(i % array_length(v_duenos, 1)) + 1], updated_at = now()
    from generate_subscripts(v_regalo_nums, 1) i
    where e.evento_id = p_evento_id and e.regalo_numero = v_regalo_nums[i];

  elsif v_turno.numero_ruleta = 3 then
    v_accion := 'intercambiar';
    if p_objetivo_ids is null or array_length(p_objetivo_ids, 1) <> 1 then
      raise exception 'este resultado requiere elegir exactamente 1 persona';
    end if;

    select regalo_numero into v_regalo_actual_participante from public.estado_regalos
    where evento_id = p_evento_id and dueno_actual_id = auth.uid();
    select regalo_numero into v_regalo_objetivo from public.estado_regalos
    where evento_id = p_evento_id and dueno_actual_id = p_objetivo_ids[1];

    if v_regalo_actual_participante is null or v_regalo_objetivo is null then
      raise exception 'no se encontró el regalo de una de las personas';
    end if;

    update public.estado_regalos set dueno_actual_id = p_objetivo_ids[1], updated_at = now()
    where evento_id = p_evento_id and regalo_numero = v_regalo_actual_participante;
    update public.estado_regalos set dueno_actual_id = auth.uid(), updated_at = now()
    where evento_id = p_evento_id and regalo_numero = v_regalo_objetivo;

  elsif v_turno.numero_ruleta = 4 then
    v_accion := 'elegir_2';
    if p_objetivo_ids is null or array_length(p_objetivo_ids, 1) <> 2 then
      raise exception 'este resultado requiere elegir exactamente 2 personas';
    end if;

    select regalo_numero into v_regalo_actual_participante from public.estado_regalos
    where evento_id = p_evento_id and dueno_actual_id = p_objetivo_ids[1];
    select regalo_numero into v_regalo_objetivo from public.estado_regalos
    where evento_id = p_evento_id and dueno_actual_id = p_objetivo_ids[2];

    if v_regalo_actual_participante is null or v_regalo_objetivo is null then
      raise exception 'no se encontró el regalo de una de las personas';
    end if;

    update public.estado_regalos set dueno_actual_id = p_objetivo_ids[2], updated_at = now()
    where evento_id = p_evento_id and regalo_numero = v_regalo_actual_participante;
    update public.estado_regalos set dueno_actual_id = p_objetivo_ids[1], updated_at = now()
    where evento_id = p_evento_id and regalo_numero = v_regalo_objetivo;

  elsif v_turno.numero_ruleta = 5 then
    v_accion := 'cambios_multiples';
    if p_objetivo_ids is null or array_length(p_objetivo_ids, 1) < 3 then
      raise exception 'este resultado requiere elegir 3 o más personas';
    end if;

    -- v_subset_regalos[i] = regalo currently owned by p_objetivo_ids[i].
    -- Rotation: that regalo's new owner becomes p_objetivo_ids[i+1] (wrapping).
    select array_agg(e.regalo_numero order by t.ordinality) into v_subset_regalos
    from unnest(p_objetivo_ids) with ordinality as t(usuario_id, ordinality)
    join public.estado_regalos e on e.evento_id = p_evento_id and e.dueno_actual_id = t.usuario_id;

    if array_length(v_subset_regalos, 1) <> array_length(p_objetivo_ids, 1) then
      raise exception 'no se encontró el regalo de una de las personas';
    end if;

    update public.estado_regalos e
    set dueno_actual_id = p_objetivo_ids[(i % array_length(p_objetivo_ids, 1)) + 1], updated_at = now()
    from generate_subscripts(v_subset_regalos, 1) i
    where e.evento_id = p_evento_id and e.regalo_numero = v_subset_regalos[i];

  else
    raise exception 'número de ruleta inválido';
  end if;

  select jsonb_agg(jsonb_build_object('regalo_numero', regalo_numero, 'dueno_actual_id', dueno_actual_id))
  into v_snapshot_after
  from public.estado_regalos where evento_id = p_evento_id;

  update public.turnos_ruleta
  set accion = v_accion,
      detalles = jsonb_build_object('objetivo_ids', to_jsonb(p_objetivo_ids), 'antes', v_snapshot_before, 'despues', v_snapshot_after)
  where id = v_turno.id
  returning * into v_turno;

  update public.eventos set turno_actual = p_numero_turno where id = p_evento_id;

  return v_turno;
end;
$$;

revoke execute on function public.resolver_turno_ruleta(uuid, int, uuid[]) from public, anon;
grant execute on function public.resolver_turno_ruleta(uuid, int, uuid[]) to authenticated;
