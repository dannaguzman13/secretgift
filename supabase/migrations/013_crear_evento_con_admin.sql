-- 013_crear_evento_con_admin.sql
-- crearEvento() needs to insert the admin into participantes right after creating
-- the event. participantes deliberately has no client-facing INSERT policy (rows
-- only ever come from SECURITY DEFINER functions, per migrations 001-011's
-- established pattern). Rather than relax RLS, add a SECURITY DEFINER function
-- that creates the event and auto-joins its admin atomically (per
-- SPEC_FASE1_SORTEO.md item A.8's alternative option).

create function public.crear_evento_con_admin(
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

  insert into public.eventos (admin_id, nombre, presupuesto, fecha_compra, fecha_revelacion, codigo_acceso)
  values (auth.uid(), p_nombre, p_presupuesto, p_fecha_compra, p_fecha_revelacion, p_codigo_acceso)
  returning * into v_evento;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento.id, auth.uid(), 'participante', 'confirmado');

  return v_evento;
end;
$$;

revoke execute on function public.crear_evento_con_admin(text, numeric, date, date, text) from public, anon;
grant execute on function public.crear_evento_con_admin(text, numeric, date, date, text) to authenticated;
