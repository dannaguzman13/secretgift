-- Break self-referential RLS recursion on participantes by routing membership
-- checks through SECURITY DEFINER helper functions (which bypass RLS internally).

create or replace function public.is_event_member(p_evento_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.participantes
    where evento_id = p_evento_id and usuario_id = auth.uid()
  )
  or exists (
    select 1 from public.eventos
    where id = p_evento_id and admin_id = auth.uid()
  );
$$;
grant execute on function public.is_event_member(uuid) to authenticated;

create or replace function public.shares_event_with(p_usuario_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.participantes p1
    join public.participantes p2 on p1.evento_id = p2.evento_id
    where p1.usuario_id = p_usuario_id and p2.usuario_id = auth.uid()
  )
  or exists (
    select 1 from public.eventos e
    join public.participantes p on p.evento_id = e.id
    where p.usuario_id = p_usuario_id and e.admin_id = auth.uid()
  );
$$;
grant execute on function public.shares_event_with(uuid) to authenticated;

drop policy "participantes: view within own eventos" on public.participantes;
create policy "participantes: view within own eventos" on public.participantes
  for select using (public.is_event_member(evento_id));

drop policy "eventos: participants see joined" on public.eventos;
create policy "eventos: participants see joined" on public.eventos
  for select using (public.is_event_member(id));

drop policy "usuarios: shared-event visibility" on public.usuarios;
create policy "usuarios: shared-event visibility" on public.usuarios
  for select using (public.shares_event_with(id));
