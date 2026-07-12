-- Public read models are intentionally read-only at the grant layer.
do $$
declare
  view_record record;
begin
  for view_record in
    select schemaname, viewname
    from pg_views
    where schemaname = 'public' and viewname like '%\_public' escape '\'
  loop
    execute format('revoke all privileges on %I.%I from anon, authenticated',
      view_record.schemaname, view_record.viewname);
    execute format('grant select on %I.%I to anon, authenticated',
      view_record.schemaname, view_record.viewname);
  end loop;
end
$$;
