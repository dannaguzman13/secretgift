-- Postgres mishandles a table's own self-referencing SELECT policy (via a
-- SECURITY DEFINER function that re-queries the same table) when evaluated
-- during INSERT ... RETURNING in the same command -- even though the exact
-- same check works fine as a separate, subsequent statement. crearEvento's
-- `.insert(...).select().single()` on eventos hit this. Fix: make the
-- admin's own visibility check a direct column comparison instead of
-- routing through is_event_member(), which internally re-queries eventos.
drop policy "eventos: admin or participant views" on public.eventos;
create policy "eventos: admin or participant views" on public.eventos
  for select using (
    admin_id = (select auth.uid())
    or exists (
      select 1 from public.participantes
      where evento_id = eventos.id and usuario_id = (select auth.uid())
    )
  );
