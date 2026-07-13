-- 031_resolver_turno_ruleta_sin_seleccion.sql
-- La app nunca registra intercambios reales de regalos: solo muestra una
-- instrucción de texto para que los participantes actúen físicamente en la
-- reunión. Pedir que se elijan personas específicas (para los resultados 3,
-- 4 y 5 de la ruleta) no aportaba nada — no se usaba ni se mostraba en
-- ningún lado — y obligaba a elegir a "3 o más" cuando a veces el evento
-- solo tiene 3 participantes en total (forzando a elegirse a uno mismo).
-- Se elimina la validación de conteo de p_objetivo_ids: el resultado se
-- resuelve directo a partir del número de la ruleta.

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
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select * into v_turno from public.turnos_ruleta
  where evento_id = p_evento_id and numero_turno = p_numero_turno;

  if v_turno.id is null then raise exception 'turno no encontrado'; end if;
  if v_turno.participante_id <> auth.uid() then raise exception 'este turno no te pertenece'; end if;
  if v_turno.accion <> 'pendiente' then raise exception 'este turno ya fue resuelto'; end if;

  v_accion := case v_turno.numero_ruleta
    when 1 then 'girar_derecha'
    when 2 then 'girar_izquierda'
    when 3 then 'intercambiar'
    when 4 then 'elegir_2'
    when 5 then 'cambios_multiples'
    else null
  end;

  if v_accion is null then raise exception 'número de ruleta inválido'; end if;

  update public.turnos_ruleta
  set accion = v_accion,
      detalles = jsonb_build_object(
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
