-- 029_fix_listar_estado_compras_regalo_robado.sql
-- Fix "column reference evento_id is ambiguous" error: the RETURNS TABLE output
-- columns (evento_id, usuario_id) collided with the bare column list used in the
-- INSERT ... ON CONFLICT inside the function body. #variable_conflict use_column
-- tells plpgsql to resolve ambiguous identifiers as table columns, not OUT vars.

create or replace function public.listar_estado_compras_regalo_robado(p_evento_id uuid)
returns table(
  id uuid,
  evento_id uuid,
  usuario_id uuid,
  usuario_nombre text,
  estado text,
  comprado_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not public.is_event_member(p_evento_id) then raise exception 'no tienes acceso a este evento'; end if;

  insert into public.regalo_robado_compras (evento_id, usuario_id)
  select p.evento_id, p.usuario_id
  from public.participantes p
  join public.eventos e on e.id = p.evento_id
  where p.evento_id = p_evento_id
    and e.modo = 'regalo_robado'
    and p.estado = 'confirmado'
  on conflict (evento_id, usuario_id) do nothing;

  return query
    select
      c.id,
      c.evento_id,
      c.usuario_id,
      u.nombre as usuario_nombre,
      c.estado,
      c.comprado_at,
      c.created_at,
      c.updated_at
    from public.regalo_robado_compras c
    join public.usuarios u on u.id = c.usuario_id
    where c.evento_id = p_evento_id
    order by u.nombre;
end;
$$;
