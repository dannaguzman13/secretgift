create table public.asignaciones (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  comprador_id uuid not null references public.usuarios(id) on delete cascade,
  estado text not null default 'pendiente' check (estado in ('pendiente','comprado')),
  comprado_at timestamptz,
  nota_comprador text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(evento_id, comprador_id)
);
create index idx_asignaciones_evento on public.asignaciones(evento_id);
create index idx_asignaciones_comprador on public.asignaciones(comprador_id);
alter table public.asignaciones enable row level security;

create policy "asignaciones: comprador or admin views" on public.asignaciones
  for select using (
    auth.uid() = comprador_id
    or exists (select 1 from public.eventos where id = asignaciones.evento_id and admin_id = auth.uid())
  );

create policy "asignaciones: comprador updates own estado" on public.asignaciones
  for update using (auth.uid() = comprador_id) with check (auth.uid() = comprador_id);
-- deliberately no insert policy for authenticated: rows are only created via join_event_by_code()
