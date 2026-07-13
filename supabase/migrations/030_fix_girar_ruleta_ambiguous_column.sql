-- 030_fix_girar_ruleta_ambiguous_column.sql
-- Fix "column reference numero_turno is ambiguous" error: the RETURNS TABLE
-- output column numero_turno collided with the turnos_ruleta.numero_turno
-- column referenced bare inside an EXISTS subquery. #variable_conflict
-- use_column tells plpgsql to resolve ambiguous identifiers as table columns.

create or replace function public.girar_ruleta(p_evento_id uuid)
returns table(numero_turno int, numero_ruleta int)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
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
