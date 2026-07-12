-- Lock down search_path on set_updated_at (was missing it)
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- handle_new_user should only ever run via the auth trigger, never as a direct RPC call
revoke execute on function public.handle_new_user() from public;

-- Consolidate duplicate permissive SELECT policies + wrap auth.uid() in (select ...)
-- so it's evaluated once per query instead of once per row.

drop policy "eventos: admin sees own" on public.eventos;
drop policy "eventos: participants see joined" on public.eventos;
create policy "eventos: admin or participant views" on public.eventos
  for select using (public.is_event_member(id));

drop policy "eventos: admin creates" on public.eventos;
create policy "eventos: admin creates" on public.eventos
  for insert with check ((select auth.uid()) = admin_id);

drop policy "eventos: admin updates own" on public.eventos;
create policy "eventos: admin updates own" on public.eventos
  for update using ((select auth.uid()) = admin_id);

drop policy "usuarios: select own row" on public.usuarios;
drop policy "usuarios: shared-event visibility" on public.usuarios;
create policy "usuarios: self or shared-event visibility" on public.usuarios
  for select using ((select auth.uid()) = id or public.shares_event_with(id));

drop policy "usuarios: update own row" on public.usuarios;
create policy "usuarios: update own row" on public.usuarios
  for update using ((select auth.uid()) = id);

drop policy "receptor_tokens: admin only" on public.eventos_receptor_tokens;
create policy "receptor_tokens: admin only" on public.eventos_receptor_tokens
  for select using (
    exists (select 1 from public.eventos where id = eventos_receptor_tokens.evento_id and admin_id = (select auth.uid()))
  );

drop policy "receptor_tokens: admin inserts" on public.eventos_receptor_tokens;
create policy "receptor_tokens: admin inserts" on public.eventos_receptor_tokens
  for insert with check (
    exists (select 1 from public.eventos where id = eventos_receptor_tokens.evento_id and admin_id = (select auth.uid()))
  );

drop policy "preferencias: only receptor inserts" on public.preferencias;
create policy "preferencias: only receptor inserts" on public.preferencias
  for insert with check (
    exists (select 1 from public.eventos where id = evento_id and receptor_id = (select auth.uid()))
  );

drop policy "preferencias: only receptor updates" on public.preferencias;
create policy "preferencias: only receptor updates" on public.preferencias
  for update using (
    exists (select 1 from public.eventos where id = preferencias.evento_id and receptor_id = (select auth.uid()))
  );

drop policy "asignaciones: comprador or admin views" on public.asignaciones;
create policy "asignaciones: comprador or admin views" on public.asignaciones
  for select using (
    (select auth.uid()) = comprador_id
    or exists (select 1 from public.eventos where id = asignaciones.evento_id and admin_id = (select auth.uid()))
  );

drop policy "asignaciones: comprador updates own estado" on public.asignaciones;
create policy "asignaciones: comprador updates own estado" on public.asignaciones
  for update using ((select auth.uid()) = comprador_id) with check ((select auth.uid()) = comprador_id);
