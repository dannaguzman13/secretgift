create table public.participantes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  rol text not null check (rol in ('comprador','receptor')),
  estado text not null default 'confirmado' check (estado in ('invitado','confirmado','cancelado')),
  created_at timestamptz default now(),
  unique(evento_id, usuario_id)
);
create index idx_participantes_evento on public.participantes(evento_id);
create index idx_participantes_usuario on public.participantes(usuario_id);
alter table public.participantes enable row level security;

create policy "participantes: view within own eventos" on public.participantes
  for select using (
    exists (
      select 1 from public.eventos e
      where e.id = participantes.evento_id
      and (
        e.admin_id = auth.uid()
        or exists (select 1 from public.participantes p2 where p2.evento_id = e.id and p2.usuario_id = auth.uid())
      )
    )
  );

-- eventos: participants can see joined eventos (deferred here since it needs participantes to exist)
create policy "eventos: participants see joined" on public.eventos
  for select using (
    exists (select 1 from public.participantes where evento_id = eventos.id and usuario_id = auth.uid())
  );

-- usuarios: cross-visibility within a shared evento (deferred here for the same reason)
create policy "usuarios: shared-event visibility" on public.usuarios
  for select using (
    exists (
      select 1 from public.participantes p1
      join public.participantes p2 on p1.evento_id = p2.evento_id
      where p1.usuario_id = usuarios.id and p2.usuario_id = auth.uid()
    )
    or exists (
      select 1 from public.eventos e
      join public.participantes p on p.evento_id = e.id
      where p.usuario_id = usuarios.id and e.admin_id = auth.uid()
    )
  );

-- NOTE: the self-referential subquery above on `participantes` causes Postgres RLS
-- infinite-recursion errors at query time. It is corrected in 004_fix_rls_recursion.sql.
