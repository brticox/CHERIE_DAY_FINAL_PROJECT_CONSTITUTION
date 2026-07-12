-- Phase-zero security closure.
-- Public buckets serve objects through their public URLs and do not need a
-- broad storage.objects SELECT policy that also enables directory listing.
drop policy if exists "legal-documents public read" on storage.objects;
drop policy if exists "public-media public read" on storage.objects;

-- RLS helper functions are needed by authenticated policies, not by anonymous
-- Data API callers. Keep submit_public_intake intentionally callable by anon.
revoke execute on function public.current_customer_id() from anon;
revoke execute on function public.current_staff_id() from anon;
revoke execute on function public.current_staff_role() from anon;
revoke execute on function public.has_staff_role(text[]) from anon;
revoke execute on function public.is_staff() from anon;
revoke execute on function public.update_customer_profile(text, text) from anon;

-- Prevent future functions from becoming public RPC endpoints by default.
alter default privileges for role postgres in schema public
  revoke execute on functions from public;
