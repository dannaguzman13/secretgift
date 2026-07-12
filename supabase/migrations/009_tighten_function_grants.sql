revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.get_event_preview_by_code(text) from public;
revoke execute on function public.get_event_preview_by_token(uuid) from public;
revoke execute on function public.join_event_by_code(text) from public, anon;
revoke execute on function public.claim_receptor(uuid) from public, anon;
revoke execute on function public.is_event_member(uuid) from public, anon;
revoke execute on function public.shares_event_with(uuid) from public, anon;

grant execute on function public.get_event_preview_by_code(text) to anon, authenticated;
grant execute on function public.get_event_preview_by_token(uuid) to anon, authenticated;
grant execute on function public.join_event_by_code(text) to authenticated;
grant execute on function public.claim_receptor(uuid) to authenticated;
grant execute on function public.is_event_member(uuid) to authenticated;
grant execute on function public.shares_event_with(uuid) to authenticated;
