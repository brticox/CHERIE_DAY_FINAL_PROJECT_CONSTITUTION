-- ---------------------------------------------------------------------------
-- KVKK customer self-service — data-access/export and account-deletion
-- REQUESTS (not immediate destructive actions), plus a narrow marketing-consent
-- toggle.
--
-- Under KVKK/GDPR a customer can ask to receive their data or to have their
-- account erased, but CHERIE DAY must retain legally-required commercial
-- records (orders, invoices, payments). We therefore model these as auditable
-- REQUESTS that operations fulfils while honouring retention — never an
-- immediate hard delete of customer/order rows.
--
-- ROLLBACK NOTES:
--   drop function if exists public.set_marketing_consent(boolean);
--   drop function if exists public.request_customer_data_action(public.data_request_kind, text);
--   drop table if exists public.customer_data_requests;
--   drop type if exists public.data_request_status;
--   drop type if exists public.data_request_kind;
-- ---------------------------------------------------------------------------

create type public.data_request_kind as enum ('export', 'deletion');
create type public.data_request_status as enum ('pending', 'in_review', 'completed', 'rejected', 'cancelled');

create table public.customer_data_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  kind public.data_request_kind not null,
  status public.data_request_status not null default 'pending',
  note text check (note is null or length(note) <= 2000),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_note text                              -- ADMIN-ONLY
);
create index customer_data_requests_customer_idx on public.customer_data_requests (customer_id);

-- At most one OPEN request of each kind per customer (prevents duplicate spam).
create unique index customer_data_requests_open_uidx
  on public.customer_data_requests (customer_id, kind)
  where status in ('pending', 'in_review');

alter table public.customer_data_requests enable row level security;

-- Customer may read their own requests.
create policy cust_select_own on public.customer_data_requests for select to authenticated
  using (customer_id = public.current_customer_id());
-- Customer may create a request only for themselves, and only in the initial
-- 'pending' state — they can never insert a pre-resolved row.
create policy cust_insert_own on public.customer_data_requests for insert to authenticated
  with check (customer_id = public.current_customer_id() and status = 'pending');
-- Staff (admin) manage fulfilment.
create policy admin_manage_all on public.customer_data_requests for all to authenticated
  using (public.has_staff_role(array['admin']))
  with check (public.has_staff_role(array['admin']));

grant select, insert on public.customer_data_requests to authenticated;

-- ---------------------------------------------------------------------------
-- request_customer_data_action(kind, note) — create a KVKK request idempotently.
-- SECURITY INVOKER: runs under the caller's RLS (cust_insert_own), so a customer
-- can only ever file a request for themselves. Returns the existing open request
-- id if one is already pending, so a double click never creates duplicates.
-- ---------------------------------------------------------------------------
create or replace function public.request_customer_data_action(
  p_kind public.data_request_kind,
  p_note text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_customer uuid := public.current_customer_id();
  v_existing uuid;
  v_id uuid;
begin
  if v_customer is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select id into v_existing
  from public.customer_data_requests
  where customer_id = v_customer and kind = p_kind and status in ('pending', 'in_review')
  limit 1;
  if v_existing is not null then
    return v_existing;
  end if;

  insert into public.customer_data_requests (customer_id, kind, status, note)
  values (v_customer, p_kind, 'pending', nullif(btrim(coalesce(p_note, '')), ''))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.request_customer_data_action(public.data_request_kind, text) from public;
grant execute on function public.request_customer_data_action(public.data_request_kind, text) to authenticated;

-- ---------------------------------------------------------------------------
-- set_marketing_consent(opt_in) — the ONLY customer-writable path to
-- customers.marketing_consent_at. SECURITY DEFINER is justified and tightly
-- scoped: migration 0015 deliberately removed the customer UPDATE policy on
-- public.customers (so customers cannot self-edit email/status/etc.), and this
-- function — mirroring the existing update_customer_profile precedent — updates
-- exactly one consent column for the authenticated customer and nothing else.
-- Marketing consent is kept separate from notification channel preferences, so
-- opting into a marketing channel is never treated as KVKK consent.
-- ---------------------------------------------------------------------------
create or replace function public.set_marketing_consent(p_opt_in boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer uuid := public.current_customer_id();
begin
  if v_customer is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  update public.customers
    set marketing_consent_at = case when p_opt_in then now() else null end,
        updated_at = now()
    where id = v_customer;
end;
$$;

revoke all on function public.set_marketing_consent(boolean) from public;
grant execute on function public.set_marketing_consent(boolean) to authenticated;
