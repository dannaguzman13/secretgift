-- 035_fix_regalo_robado_nombres.sql
-- Fixes a regression from 033_perfil_destino_evento.sql: dropping the
-- "usuarios: shared-event visibility (no ultra secreto)" policy broke every
-- direct table join on public.usuarios(nombre) for participants other than
-- the caller themselves (RLS now only allows selecting your own row).
--
-- listar_participantes_convencional (021) already exists for this purpose but
-- was never wired up on the client, and regalo_robado_turnos has no
-- equivalent RPC at all. Add the missing RPC for turn order names.

create or replace function public.obtener_orden_turnos_regalo_robado(p_evento_id uuid)
returns table(
  id uuid,
  evento_id uuid,
  usuario_id uuid,
  orden int,
  created_at timestamptz,
  usuario_nombre text
)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not public.is_event_member(p_evento_id) then raise exception 'no tienes acceso a este evento'; end if;

  return query
    select
      t.id,
      t.evento_id,
      t.usuario_id,
      t.orden,
      t.created_at,
      u.nombre as usuario_nombre
    from public.regalo_robado_turnos t
    join public.usuarios u on u.id = t.usuario_id
    where t.evento_id = p_evento_id
    order by t.orden;
end;
$$;

revoke execute on function public.obtener_orden_turnos_regalo_robado(uuid) from public, anon;
grant execute on function public.obtener_orden_turnos_regalo_robado(uuid) to authenticated;
