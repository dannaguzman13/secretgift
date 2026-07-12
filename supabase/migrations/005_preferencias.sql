create table public.preferencias (
  evento_id uuid primary key references public.eventos(id) on delete cascade,
  deseos text[] not null default '{}',
  restricciones text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.preferencias enable row level security;

create policy "preferencias: participant or admin views" on public.preferencias
  for select using (public.is_event_member(evento_id));

create policy "preferencias: only receptor inserts" on public.preferencias
  for insert with check (
    exists (select 1 from public.eventos where id = evento_id and receptor_id = auth.uid())
  );

create policy "preferencias: only receptor updates" on public.preferencias
  for update using (
    exists (select 1 from public.eventos where id = preferencias.evento_id and receptor_id = auth.uid())
  );
