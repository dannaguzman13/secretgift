alter table public.usuarios
  add column apodo text,
  add column descripcion text,
  add column perfil_completo jsonb not null default '{"campos_activos": []}'::jsonb;

create index idx_usuarios_apodo on public.usuarios (apodo);

-- update own row policy already exists (see 001_usuarios.sql); no new RLS policy needed.

-- Pre-existing bug fix: usuarios was the only table missing a table-level
-- SELECT grant for `authenticated`, so the existing RLS select policy could
-- never actually apply for logged-in users reading their own row.
grant select on public.usuarios to authenticated;
