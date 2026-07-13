-- 026_eventos_updated_at_trigger.sql
-- eventos.updated_at exists since 002_eventos.sql but nothing has ever bumped it
-- on UPDATE. Needed for Cambio 3 (event editing) to reflect when an event was
-- last edited. Reuses the set_updated_at() trigger function already defined
-- elsewhere in this project.

create trigger eventos_set_updated_at
  before update on public.eventos
  for each row execute function public.set_updated_at();
