drop policy "asignaciones: comprador or admin views" on public.asignaciones;
create policy "asignaciones: comprador, admin, or post-reveal participant views" on public.asignaciones
  for select using (
    (select auth.uid()) = comprador_id
    or exists (select 1 from public.eventos where id = asignaciones.evento_id and admin_id = (select auth.uid()))
    or (
      exists (select 1 from public.eventos where id = asignaciones.evento_id and estado = 'completado')
      and public.is_event_member(asignaciones.evento_id)
    )
  );
