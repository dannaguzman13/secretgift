-- 024_fecha_intercambio.sql
-- Replace fecha_revelacion (date) with fecha_intercambio (timestamptz) so the
-- exchange has an exact time, not just a day. This is the reference point for
-- the countdown (Cambio 1) and event editing (Cambio 3). fecha_compra (purchase
-- deadline) keeps its existing name/type — only its relation constraint changes.

alter table public.eventos add column fecha_intercambio timestamptz;

update public.eventos
set fecha_intercambio = (fecha_revelacion::timestamp + interval '18 hours') at time zone 'utc'
where fecha_revelacion is not null;

alter table public.eventos alter column fecha_intercambio set not null;

alter table public.eventos drop constraint eventos_check;
alter table public.eventos add constraint eventos_fecha_compra_vs_intercambio check (fecha_compra <= fecha_intercambio::date);

alter table public.eventos drop column fecha_revelacion;

-- crear_evento_con_admin: p_fecha_revelacion date -> p_fecha_intercambio timestamptz
drop function if exists public.crear_evento_con_admin(text, numeric, date, date, text, text, text, text, text, text, text, text, text);
create or replace function public.crear_evento_con_admin(
  p_nombre text,
  p_presupuesto numeric,
  p_fecha_compra date,
  p_fecha_intercambio timestamptz,
  p_codigo_acceso text,
  p_modo text default 'amigo_secreto',
  p_universo text default null,
  p_emoji text default null,
  p_descripcion text default null,
  p_tematica text default null,
  p_restricciones text default null,
  p_requisitos text default null,
  p_recomendacion text default null
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

  insert into public.eventos (
    admin_id, nombre, presupuesto, fecha_compra, fecha_intercambio, codigo_acceso, modo, universo,
    emoji, descripcion, tematica, restricciones, requisitos, recomendacion
  )
  values (
    auth.uid(), p_nombre, p_presupuesto, p_fecha_compra, p_fecha_intercambio, p_codigo_acceso, p_modo, p_universo,
    p_emoji, p_descripcion, p_tematica, p_restricciones, p_requisitos, p_recomendacion
  )
  returning * into v_evento;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento.id, auth.uid(), 'participante', 'confirmado');

  return v_evento;
end;
$$;

revoke execute on function public.crear_evento_con_admin(text, numeric, date, timestamptz, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.crear_evento_con_admin(text, numeric, date, timestamptz, text, text, text, text, text, text, text, text, text) to authenticated;

-- get_event_preview_by_code: expose fecha_intercambio instead of fecha_compra alone
drop function if exists public.get_event_preview_by_code(text);
create function public.get_event_preview_by_code(p_codigo text)
returns table(
  id uuid,
  nombre text,
  presupuesto numeric,
  fecha_compra date,
  fecha_intercambio timestamptz,
  estado text,
  sorteo_realizado_at timestamptz,
  modo text,
  universo text,
  participantes_count int
)
language sql stable security definer set search_path = public as $$
  select
    e.id, e.nombre, e.presupuesto, e.fecha_compra, e.fecha_intercambio, e.estado, e.sorteo_realizado_at,
    e.modo, e.universo,
    (select count(*)::int from public.participantes p where p.evento_id = e.id)
  from public.eventos e
  where e.codigo_acceso = upper(p_codigo);
$$;

revoke execute on function public.get_event_preview_by_code(text) from public;
grant execute on function public.get_event_preview_by_code(text) to anon, authenticated;
