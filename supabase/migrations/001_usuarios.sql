create table public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  nombre text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.usuarios enable row level security;

create policy "usuarios: select own row" on public.usuarios
  for select using (auth.uid() = id);

create policy "usuarios: update own row" on public.usuarios
  for update using (auth.uid() = id);
