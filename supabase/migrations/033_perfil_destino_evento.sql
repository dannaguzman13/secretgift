-- 033_perfil_destino_evento.sql
-- Fixes a bug where "usuarios: shared-event visibility (no ultra secreto)" (022)
-- blocked reading a recipient's profile whenever the caller and the recipient
-- also shared an unrelated ultra_secreto event elsewhere, because that policy's
-- check was global instead of scoped to the event actually being viewed.
--
-- Replaces the cross-user usuarios RLS policy with a security-definer RPC scoped
-- to a specific evento_id, following the same pattern as
-- listar_participantes_ultra_secreto / listar_participantes_convencional (021)
-- and listar_estado_compras (018).

drop policy "usuarios: shared-event visibility (no ultra secreto)" on public.usuarios;

create function public.obtener_perfil_destino(p_evento_id uuid, p_usuario_id uuid)
returns table(nombre text, apodo text, descripcion text, perfil_completo jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select u.nombre, u.apodo, u.descripcion, u.perfil_completo
  from public.usuarios u
  where u.id = p_usuario_id
    and public.is_event_member(p_evento_id)
    and exists (
      select 1 from public.participantes p
      where p.evento_id = p_evento_id and p.usuario_id = p_usuario_id
    )
    and not exists (
      select 1 from public.eventos e
      where e.id = p_evento_id
        and e.modo = 'ultra_secreto'
        and e.estado <> 'completado'
    );
$$;

revoke execute on function public.obtener_perfil_destino(uuid, uuid) from public, anon;
grant execute on function public.obtener_perfil_destino(uuid, uuid) to authenticated;
