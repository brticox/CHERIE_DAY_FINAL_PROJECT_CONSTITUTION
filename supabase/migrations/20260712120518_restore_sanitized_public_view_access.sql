-- The *_public views are explicit sanitized API contracts. They must be able to
-- read their RLS-locked source tables without granting customers direct access
-- to private columns such as products.internal_cost.
do $$
declare
  view_record record;
begin
  for view_record in
    select schemaname, viewname
    from pg_views
    where schemaname = 'public' and viewname like '%\_public' escape '\'
  loop
    execute format('alter view %I.%I set (security_invoker = false)',
      view_record.schemaname, view_record.viewname);
  end loop;
end
$$;
