-- These RPCs already enforce an explicit allow-list, validate the requested
-- transition, and write an audit record. SECURITY DEFINER lets that guarded
-- boundary reach the RLS-hidden outbox row without granting direct table access.
alter function public.admin_retry_notification(uuid)
  security definer
  set search_path = public, pg_temp;
alter function public.admin_cancel_notification(uuid)
  security definer
  set search_path = public, pg_temp;
alter function public.admin_mark_notification_for_review(uuid)
  security definer
  set search_path = public, pg_temp;

revoke all on function public.admin_retry_notification(uuid) from public, anon;
revoke all on function public.admin_cancel_notification(uuid) from public, anon;
revoke all on function public.admin_mark_notification_for_review(uuid) from public, anon;
grant execute on function public.admin_retry_notification(uuid) to authenticated;
grant execute on function public.admin_cancel_notification(uuid) to authenticated;
grant execute on function public.admin_mark_notification_for_review(uuid) to authenticated;
