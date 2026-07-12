create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.usuarios(id) on delete cascade,
  nombre text not null,
  presupuesto numeric(10,2) not null check (presupuesto > 0),
  receptor_id uuid references public.usuarios(id) on delete set null,
  receptor_nombre text not null,
  receptor_email text not null,
  fecha_compra date not null,
  fecha_revelacion date not null,
  estado text not null default 'activo' check (estado in ('activo','completado','cancelado')),
  codigo_acceso text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (fecha_revelacion >= fecha_compra)
);
create index idx_eventos_admin on public.eventos(admin_id);
create index idx_eventos_codigo on public.eventos(codigo_acceso);
create index idx_eventos_receptor on public.eventos(receptor_id);

create table public.eventos_receptor_tokens (
  evento_id uuid primary key references public.eventos(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz default now()
);

alter table public.eventos enable row level security;
alter table public.eventos_receptor_tokens enable row level security;

create policy "eventos: admin sees own" on public.eventos
  for select using (auth.uid() = admin_id);

create policy "eventos: admin creates" on public.eventos
  for insert with check (auth.uid() = admin_id);

create policy "eventos: admin updates own" on public.eventos
  for update using (auth.uid() = admin_id);

create policy "receptor_tokens: admin only" on public.eventos_receptor_tokens
  for select using (
    exists (select 1 from public.eventos where id = eventos_receptor_tokens.evento_id and admin_id = auth.uid())
  );

create policy "receptor_tokens: admin inserts" on public.eventos_receptor_tokens
  for insert with check (
    exists (select 1 from public.eventos where id = eventos_receptor_tokens.evento_id and admin_id = auth.uid())
  );
