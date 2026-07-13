-- 014_defensive_usuarios_check.sql
-- If a caller is authenticated (auth.uid() is set) but somehow has no matching row
-- in public.usuarios (e.g. the handle_new_user trigger hasn't committed yet, or the
-- row was removed), any insert referencing that id as a FK to usuarios(id) fails
-- with a raw Postgres foreign-key-violation error. Add an explicit, friendly check
-- at the top of the two RPCs that create such references, so the client gets a
-- clear Spanish exception instead of raw Postgres text.

create or replace function public.crear_evento_con_admin(
  p_nombre text,
  p_presupuesto numeric,
  p_fecha_compra date,
  p_fecha_revelacion date,
  p_codigo_acceso text
) returns public.eventos
language plpgsql security definer set search_path = public as $$
declare
  v_evento public.eventos;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  if not exists (select 1 from public.usuarios where id = auth.uid()) then
    raise exception 'tu cuenta no completó el registro correctamente, cierra sesión y vuelve a iniciarla';
  end if;

  insert into public.eventos (admin_id, nombre, presupuesto, fecha_compra, fecha_revelacion, codigo_acceso)
  values (auth.uid(), p_nombre, p_presupuesto, p_fecha_compra, p_fecha_revelacion, p_codigo_acceso)
  returning * into v_evento;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento.id, auth.uid(), 'participante', 'confirmado');

  return v_evento;
end;
$$;

create or replace function public.join_event_by_code(p_codigo text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_evento_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  if not exists (select 1 from public.usuarios where id = auth.uid()) then
    raise exception 'tu cuenta no completó el registro correctamente, cierra sesión y vuelve a iniciarla';
  end if;

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
