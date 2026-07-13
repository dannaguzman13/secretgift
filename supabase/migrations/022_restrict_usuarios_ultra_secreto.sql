-- 022_restrict_usuarios_ultra_secreto.sql
-- Fixes V-001: a participant in an ultra_secreto event must not be able to read
-- another shared-event participant's row in public.usuarios (real name, email, etc.)
-- by querying the table directly, even though RLS previously allowed shared-event
-- visibility for any shared event regardless of mode.

drop policy "usuarios: self or shared-event visibility" on public.usuarios;

create policy "usuarios: self visibility" on public.usuarios
  for select using ((select auth.uid()) = id);

create policy "usuarios: shared-event visibility (no ultra secreto)" on public.usuarios
  for select using (
    public.shares_event_with(id)
    and not exists (
      select 1 from public.participantes p1
      join public.eventos e on e.id = p1.evento_id
      join public.participantes p2 on p2.evento_id = e.id
      where p1.usuario_id = usuarios.id
        and p2.usuario_id = (select auth.uid())
        and e.modo = 'ultra_secreto'
    )
  );
