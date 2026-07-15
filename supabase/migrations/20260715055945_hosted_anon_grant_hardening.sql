-- Supabase-hosted projects may grant broad table privileges to `anon` through
-- platform defaults. Public reads in CHERIE DAY are intentionally limited to
-- sanitized *_public views and explicitly granted RPCs.
revoke all privileges on all tables in schema public from anon;
revoke all privileges on all sequences in schema public from anon;

-- Keep the explicit, read-only public API contract available after removing
-- access to every underlying base table.
do $$
declare
  view_record record;
begin
  for view_record in
    select schemaname, viewname
    from pg_views
    where schemaname = 'public'
      and viewname like '%\_public' escape '\'
  loop
    execute format(
      'grant select on %I.%I to anon',
      view_record.schemaname,
      view_record.viewname
    );
  end loop;
end
$$;

-- New public-schema tables and sequences must remain fail-closed for anonymous
-- requests unless a later reviewed migration grants a narrower contract.
alter default privileges in schema public
  revoke all privileges on tables from anon;
alter default privileges in schema public
  revoke all privileges on sequences from anon;
