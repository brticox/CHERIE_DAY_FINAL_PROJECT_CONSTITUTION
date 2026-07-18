-- Exact dashboard revenue aggregates. The definer boundary admits only roles
-- that hold the application-level finance.read capability.
create or replace function public.admin_dashboard_revenue()
returns table(
  today_amount numeric,
  week_amount numeric,
  month_amount numeric,
  paid_order_count bigint
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_staff_role(array['admin', 'commerce_manager', 'finance_viewer']) then
    raise exception 'permission denied' using errcode = '42501';
  end if;

  return query with boundaries as (
    select
      date_trunc('day', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul' as day_start,
      (date_trunc('day', now() at time zone 'Europe/Istanbul') - interval '6 days') at time zone 'Europe/Istanbul' as week_start,
      date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul' as month_start
  )
  select
    coalesce(sum(o.total_amount) filter (where o.created_at >= b.day_start), 0),
    coalesce(sum(o.total_amount) filter (where o.created_at >= b.week_start), 0),
    coalesce(sum(o.total_amount), 0),
    count(*)
  from public.orders o
  cross join boundaries b
  where o.payment_status = 'paid'
    and o.created_at >= b.month_start;
end;
$$;

revoke all on function public.admin_dashboard_revenue() from public, anon;
grant execute on function public.admin_dashboard_revenue() to authenticated;
