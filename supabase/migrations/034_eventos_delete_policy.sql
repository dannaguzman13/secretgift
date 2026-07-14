-- 034_eventos_delete_policy.sql
-- Allows the event admin to delete their own event. All dependent tables
-- (participantes, preferencias, asignaciones, eventos_receptor_tokens, and the
-- ultra_secreto/regalo_robado tables) already reference eventos(id) on delete
-- cascade, so deleting the eventos row cleans up everything related.

create policy "eventos: admin deletes own" on public.eventos
  for delete using (auth.uid() = admin_id);
