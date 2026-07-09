-- =============================================================================
-- CHERIE DAY — RLS verification (docs/23 §Required Tests, docs/42 §10)
-- Runnable once a database exists (supabase db reset applied). Self-asserting:
-- each check RAISEs EXCEPTION on failure. Wrapped in a transaction and rolled
-- back, so it is non-destructive.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_verification.sql
--
-- Simulates roles with request.jwt.claims + `set role`, exactly like PostgREST.
-- =============================================================================
begin;

-- Two test customers with known auth uids + one order each (inserted as owner
-- of the migration, bypassing RLS).
insert into public.customers (id, auth_user_id, name, email)
values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Test A','a@example.com'),
  ('22222222-2222-2222-2222-222222222222','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Test B','b@example.com');

insert into public.orders (id, order_number, customer_id, total_amount)
values
  ('aaaa1111-0000-0000-0000-000000000001','CD-TEST-A', '11111111-1111-1111-1111-111111111111', 100),
  ('bbbb2222-0000-0000-0000-000000000002','CD-TEST-B', '22222222-2222-2222-2222-222222222222', 200);

-- ---------------------------------------------------------------------------
-- Helper to assert a condition
-- ---------------------------------------------------------------------------
create or replace function pg_temp.assert(cond boolean, label text)
returns void language plpgsql as $$
begin
  if not cond then
    raise exception 'RLS CHECK FAILED: %', label;
  end if;
  raise notice 'ok: %', label;
end;
$$;

-- ===========================================================================
-- ANON checks
-- ===========================================================================
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

-- Base private/content tables must leak nothing to anon.
select pg_temp.assert((select count(*) from public.leads) = 0,            'anon cannot read leads');
select pg_temp.assert((select count(*) from public.orders) = 0,           'anon cannot read orders');
select pg_temp.assert((select count(*) from public.payments) = 0,         'anon cannot read payments');
select pg_temp.assert((select count(*) from public.payment_events) = 0,   'anon cannot read payment_events');
select pg_temp.assert((select count(*) from public.suppliers) = 0,        'anon cannot read suppliers');
select pg_temp.assert((select count(*) from public.consent_records) = 0,  'anon cannot read consent_records');
select pg_temp.assert((select count(*) from public.reviews) = 0,          'anon cannot read reviews base table');
-- Even PUBLISHED products are invisible on the base table (reads go via view).
select pg_temp.assert((select count(*) from public.products) = 0,         'anon cannot read products base table');

-- Public views DO expose published-safe data.
select pg_temp.assert((select count(*) from public.products_public) > 0,          'anon reads products_public');
select pg_temp.assert((select count(*) from public.service_packages_public) > 0,  'anon reads service_packages_public');
select pg_temp.assert((select count(*) from public.legal_documents_public) > 0,   'anon reads legal_documents_public');

-- Anon may submit an intake lead (insert-only), but still cannot read it back.
insert into public.leads (name, email, message) values ('Anon', 'anon@example.com', 'test');
select pg_temp.assert((select count(*) from public.leads) = 0, 'anon still cannot read leads after insert');

reset role;

-- ===========================================================================
-- CUSTOMER A checks — sees only own rows
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);

select pg_temp.assert((select count(*) from public.orders) = 1,           'customer A sees exactly 1 order');
select pg_temp.assert(exists (select 1 from public.orders where order_number = 'CD-TEST-A'), 'customer A sees own order');
select pg_temp.assert(not exists (select 1 from public.orders where order_number = 'CD-TEST-B'), 'customer A cannot see customer B order');
select pg_temp.assert((select count(*) from public.payment_events) = 0,   'customer A cannot read payment_events');
select pg_temp.assert((select count(*) from public.suppliers) = 0,        'customer A cannot read suppliers');

reset role;

-- ===========================================================================
-- CUSTOMER B checks — cross-tenant isolation
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

select pg_temp.assert(not exists (select 1 from public.orders where order_number = 'CD-TEST-A'), 'customer B cannot see customer A order');

reset role;

-- All good — undo everything.
rollback;
