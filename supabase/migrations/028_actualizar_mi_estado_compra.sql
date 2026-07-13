create or replace function public.actualizar_mi_estado_compra(
  p_evento_id uuid,
  p_estado text
)
returns public.asignaciones
language plpgsql security definer set search_path = public as $$
declare
  v_row public.asignaciones;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_estado not in ('pendiente', 'comprado') then raise exception 'estado inválido'; end if;
  if not public.is_event_member(p_evento_id) then raise exception 'no tienes acceso a este evento'; end if;

  update public.asignaciones
  set
    estado = p_estado,
    comprado_at = case when p_estado = 'comprado' then now() else null end
  where evento_id = p_evento_id
    and comprador_id = auth.uid()
  returning * into v_row;

  if v_row.id is null then
    raise exception 'no tienes una asignación de compra para este evento';
  end if;

  return v_row;
end;
$$;

revoke execute on function public.actualizar_mi_estado_compra(uuid, text) from public, anon;
grant execute on function public.actualizar_mi_estado_compra(uuid, text) to authenticated;
