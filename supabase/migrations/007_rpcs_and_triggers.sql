create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger trg_eventos_updated before update on public.eventos for each row execute function public.set_updated_at();
create trigger trg_preferencias_updated before update on public.preferencias for each row execute function public.set_updated_at();
create trigger trg_asignaciones_updated before update on public.asignaciones for each row execute function public.set_updated_at();
create trigger trg_usuarios_updated before update on public.usuarios for each row execute function public.set_updated_at();

create or replace function public.get_event_preview_by_code(p_codigo text)
returns table(id uuid, nombre text, presupuesto numeric, fecha_compra date, estado text)
language sql stable security definer set search_path = public as $$
  select id, nombre, presupuesto, fecha_compra, estado from public.eventos
  where codigo_acceso = upper(p_codigo);
$$;

create or replace function public.get_event_preview_by_token(p_token uuid)
returns table(id uuid, nombre text, receptor_nombre text, presupuesto numeric)
language sql stable security definer set search_path = public as $$
  select e.id, e.nombre, e.receptor_nombre, e.presupuesto
  from public.eventos e join public.eventos_receptor_tokens t on t.evento_id = e.id
  where t.token = p_token and e.receptor_id is null;
$$;

create or replace function public.join_event_by_code(p_codigo text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_evento_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into v_evento_id from public.eventos where codigo_acceso = upper(p_codigo) and estado = 'activo';
  if v_evento_id is null then raise exception 'invalid or inactive code'; end if;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento_id, auth.uid(), 'comprador', 'confirmado')
  on conflict (evento_id, usuario_id) do nothing;

  insert into public.asignaciones (evento_id, comprador_id)
  values (v_evento_id, auth.uid())
  on conflict (evento_id, comprador_id) do nothing;

  return v_evento_id;
end;
$$;

create or replace function public.claim_receptor(p_token uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_evento_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select evento_id into v_evento_id from public.eventos_receptor_tokens where token = p_token;
  if v_evento_id is null then raise exception 'invalid token'; end if;

  update public.eventos set receptor_id = auth.uid()
  where id = v_evento_id and receptor_id is null;
  if not found then raise exception 'event already has a receptor'; end if;

  insert into public.participantes (evento_id, usuario_id, rol, estado)
  values (v_evento_id, auth.uid(), 'receptor', 'confirmado')
  on conflict (evento_id, usuario_id) do nothing;

  return v_evento_id;
end;
$$;

grant execute on function public.get_event_preview_by_code(text) to anon, authenticated;
grant execute on function public.get_event_preview_by_token(uuid) to anon, authenticated;
grant execute on function public.join_event_by_code(text) to authenticated;
grant execute on function public.claim_receptor(uuid) to authenticated;
