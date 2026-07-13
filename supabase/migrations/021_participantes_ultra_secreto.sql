-- 021_participantes_ultra_secreto.sql
-- Fixes V-002: listing participants in ultra_secreto events must never expose real names.

create function public.listar_participantes_ultra_secreto(p_evento_id uuid)
returns table(
  id uuid,
  evento_id uuid,
  usuario_id uuid,
  rol text,
  estado text,
  created_at timestamptz,
  alias text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.evento_id,
    p.usuario_id,
    p.rol,
    p.estado,
    p.created_at,
    coalesce(a.alias, '???') as alias
  from public.participantes p
  left join public.aliases a on a.evento_id = p.evento_id and a.usuario_id = p.usuario_id
  where p.evento_id = p_evento_id
    and public.is_event_member(p_evento_id)
    and exists (
      select 1 from public.eventos
      where id = p_evento_id
      and modo = 'ultra_secreto'
    )
  order by p.created_at asc;
$$;

revoke execute on function public.listar_participantes_ultra_secreto(uuid) from public, anon;
grant execute on function public.listar_participantes_ultra_secreto(uuid) to authenticated;

-- Explicit RPC for non-ultra_secreto events, mirroring the current join-based listing.
create function public.listar_participantes_convencional(p_evento_id uuid)
returns table(
  id uuid,
  evento_id uuid,
  usuario_id uuid,
  rol text,
  estado text,
  created_at timestamptz,
  usuario_nombre text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.evento_id,
    p.usuario_id,
    p.rol,
    p.estado,
    p.created_at,
    u.nombre
  from public.participantes p
  left join public.usuarios u on u.id = p.usuario_id
  where p.evento_id = p_evento_id
    and public.is_event_member(p_evento_id)
    and exists (
      select 1 from public.eventos
      where id = p_evento_id
      and modo != 'ultra_secreto'
    );
$$;

revoke execute on function public.listar_participantes_convencional(uuid) from public, anon;
grant execute on function public.listar_participantes_convencional(uuid) to authenticated;
