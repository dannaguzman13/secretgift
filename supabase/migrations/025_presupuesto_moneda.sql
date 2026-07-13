-- 025_presupuesto_moneda.sql
-- Split presupuesto (numeric) into presupuesto_monto (numeric(10,2)) + presupuesto_moneda
-- (ISO 4217 code, char(3)) so the currency is stored explicitly instead of assumed.

alter table public.eventos add column presupuesto_monto numeric(10,2);
alter table public.eventos add column presupuesto_moneda char(3);

update public.eventos
set presupuesto_monto = presupuesto,
    presupuesto_moneda = 'USD'
where presupuesto is not null;

alter table public.eventos alter column presupuesto_monto set not null;
alter table public.eventos alter column presupuesto_moneda set not null;

alter table public.eventos add constraint eventos_presupuesto_monto_check check (presupuesto_monto > 0);
alter table public.eventos add constraint eventos_presupuesto_moneda_check check (presupuesto_moneda in ('COP','USD','EUR','MXN','ARS','BRL','CAD','GBP','JPY','CHF'));

alter table public.eventos drop constraint eventos_presupuesto_check;
alter table public.eventos drop column presupuesto;

-- crear_evento_con_admin: p_presupuesto numeric -> p_presupuesto_monto numeric, p_presupuesto_moneda text
drop function if exists public.crear_evento_con_admin(text, numeric, date, timestamptz, text, text, text, text, text, text, text, text, text);
create or replace function public.crear_evento_con_admin(
  p_nombre text,
  p_presupuesto_monto numeric,
  p_presupuesto_moneda text,
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
    admin_id, nombre, presupuesto_monto, presupuesto_moneda, fecha_compra, fecha_intercambio, codigo_acceso, modo, universo,
    emoji, descripcion, tematica, restricciones, requisitos, recomendacion
  )
  values (
    auth.uid(), p_nombre, p_presupuesto_monto, p_presupuesto_moneda, p_fecha_compra, p_fecha_intercambio, p_codigo_acceso, p_modo, p_universo,
    p_emoji, p_descripcion, p_tematica, p_restricciones, p_requisitos, p_recomendacion
  )
  returning * into v_evento;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento.id, auth.uid(), 'participante', 'confirmado');

  return v_evento;
end;
$$;

revoke execute on function public.crear_evento_con_admin(text, numeric, text, date, timestamptz, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.crear_evento_con_admin(text, numeric, text, date, timestamptz, text, text, text, text, text, text, text, text, text) to authenticated;

-- get_event_preview_by_code: expose presupuesto_monto/presupuesto_moneda
drop function if exists public.get_event_preview_by_code(text);
create function public.get_event_preview_by_code(p_codigo text)
returns table(
  id uuid,
  nombre text,
  presupuesto_monto numeric,
  presupuesto_moneda text,
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
    e.id, e.nombre, e.presupuesto_monto, e.presupuesto_moneda, e.fecha_compra, e.fecha_intercambio, e.estado, e.sorteo_realizado_at,
    e.modo, e.universo,
    (select count(*)::int from public.participantes p where p.evento_id = e.id)
  from public.eventos e
  where e.codigo_acceso = upper(p_codigo);
$$;

revoke execute on function public.get_event_preview_by_code(text) from public;
grant execute on function public.get_event_preview_by_code(text) to anon, authenticated;
