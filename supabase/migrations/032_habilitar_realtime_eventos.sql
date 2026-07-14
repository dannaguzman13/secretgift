-- 032_habilitar_realtime_eventos.sql
-- El dashboard se suscribe a cambios en tiempo real de la tabla `eventos`
-- (src/pages/DashboardPage.tsx) para reflejar el turno actual de la ruleta
-- sin recargar la página, pero ninguna tabla estaba incluida en la
-- publicación `supabase_realtime`, así que esos eventos nunca llegaban al
-- cliente y había que recargar manualmente para ver el avance del turno.

alter publication supabase_realtime add table public.eventos;
