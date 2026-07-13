-- 023_dashboard_evento_fields.sql
-- Dashboard redesign: per-event emoji/descripcion, plus regalo_robado's
-- gift-guideline fields (tematica/restricciones required for that modo,
-- requisitos/recomendacion optional), captured once by the admin at creation.

alter table public.eventos add column emoji text null;
alter table public.eventos add column descripcion text null;
alter table public.eventos add column tematica text null;
alter table public.eventos add column restricciones text null;
alter table public.eventos add column requisitos text null;
alter table public.eventos add column recomendacion text null;

alter table public.eventos
  add constraint eventos_regalo_robado_campos_requeridos check (
    (modo = 'regalo_robado' and tematica is not null and restricciones is not null) or
    (modo <> 'regalo_robado' and tematica is null and restricciones is null and requisitos is null and recomendacion is null)
  );

-- crear_evento_con_admin: accept the new optional fields (defaults keep old callers working).
drop function if exists public.crear_evento_con_admin(text, numeric, date, date, text, text, text);
create or replace function public.crear_evento_con_admin(
  p_nombre text,
  p_presupuesto numeric,
  p_fecha_compra date,
  p_fecha_revelacion date,
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
    admin_id, nombre, presupuesto, fecha_compra, fecha_revelacion, codigo_acceso, modo, universo,
    emoji, descripcion, tematica, restricciones, requisitos, recomendacion
  )
  values (
    auth.uid(), p_nombre, p_presupuesto, p_fecha_compra, p_fecha_revelacion, p_codigo_acceso, p_modo, p_universo,
    p_emoji, p_descripcion, p_tematica, p_restricciones, p_requisitos, p_recomendacion
  )
  returning * into v_evento;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento.id, auth.uid(), 'participante', 'confirmado');

  return v_evento;
end;
$$;

revoke execute on function public.crear_evento_con_admin(text, numeric, date, date, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.crear_evento_con_admin(text, numeric, date, date, text, text, text, text, text, text, text, text, text) to authenticated;
