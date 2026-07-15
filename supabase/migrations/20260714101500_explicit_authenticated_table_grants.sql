-- Supabase local/cloud migration owners do not always share identical default
-- privileges. Make the authenticated API contract explicit, but fail closed
-- if any public base table has not enabled RLS first.

do $$
declare unprotected_tables text;
begin
  select string_agg(c.relname, ', ' order by c.relname)
  into unprotected_tables
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r','p')
    and not c.relrowsecurity;

  if unprotected_tables is not null then
    raise exception 'Refusing authenticated grants; RLS missing on: %',
      unprotected_tables;
  end if;
end
$$;

grant select, insert, update, delete
  on all tables in schema public
  to authenticated;
grant usage, select
  on all sequences in schema public
  to authenticated;

-- The service-role API bypasses RLS, but PostgreSQL privileges are still
-- evaluated before policies. Keep trusted server clients operational even
-- when an environment starts from restrictive default privileges.
grant all privileges
  on all tables in schema public
  to service_role;
grant all privileges
  on all sequences in schema public
  to service_role;
