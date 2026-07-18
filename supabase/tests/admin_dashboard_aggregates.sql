begin;

create function pg_temp.assert_true(condition boolean, label text)
returns void language plpgsql as $$
begin
  if not condition then raise exception 'DASHBOARD CHECK FAILED: %', label; end if;
  raise notice 'ok: %', label;
end
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('da000000-0000-4000-8000-000000000001', 'finance-aggregate@test.local', '{}'),
  ('da000000-0000-4000-8000-000000000002', 'editor-aggregate@test.local', '{}');

insert into public.staff_users (auth_user_id, name, email, role) values
  ('da000000-0000-4000-8000-000000000001', 'Finance', 'finance-aggregate@test.local', 'finance_viewer'),
  ('da000000-0000-4000-8000-000000000002', 'Editor', 'editor-aggregate@test.local', 'content_editor');

delete from public.orders;
insert into public.orders (order_number, payment_status, total_amount, created_at)
select 'AGG-' || n, 'paid', 1, now()
from generate_series(1, 1001) as n;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'da000000-0000-4000-8000-000000000001', true);
select pg_temp.assert_true(
  (select paid_order_count = 1001 and today_amount = 1001 and month_amount = 1001
   from public.admin_dashboard_revenue()),
  'finance-authorized aggregate includes every record beyond the former 1000-row cap'
);
reset role;

create function pg_temp.assert_editor_denied()
returns void language plpgsql security invoker as $$
begin
  begin
    perform public.admin_dashboard_revenue();
  exception when insufficient_privilege then return;
  end;
  raise exception 'DASHBOARD CHECK FAILED: content editor reached finance aggregate';
end
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'da000000-0000-4000-8000-000000000002', true);
select pg_temp.assert_editor_denied();
reset role;

select pg_temp.assert_true(
  not has_function_privilege('anon', 'public.admin_dashboard_revenue()', 'execute'),
  'anonymous role cannot execute the finance aggregate'
);

rollback;
