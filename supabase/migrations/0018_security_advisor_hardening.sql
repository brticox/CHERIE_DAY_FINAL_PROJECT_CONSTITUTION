-- Make public read-model views respect the caller's grants and RLS context.
do $$
declare
  view_record record;
begin
  for view_record in
    select schemaname, viewname
    from pg_views
    where schemaname = 'public'
  loop
    execute format(
      'alter view %I.%I set (security_invoker = true)',
      view_record.schemaname,
      view_record.viewname
    );
  end loop;
end
$$;

-- Prevent object-shadowing through a caller-controlled search path.
alter function public.set_updated_at()
  set search_path = pg_catalog, public;
