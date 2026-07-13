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

insert into public.carts (id, customer_id, status)
values ('cccc1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'active');
insert into public.cart_items (id, cart_id, quantity, unit_price_snapshot, total_price_snapshot)
values ('dddd1111-0000-0000-0000-000000000001', 'cccc1111-0000-0000-0000-000000000001', 2, 100, 200);

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

-- SECURITY INVOKER helper: succeeds only when a direct anon table insert is
-- rejected by RLS. Public submissions must go through the whitelisted RPC.
create or replace function pg_temp.assert_direct_lead_insert_blocked()
returns void language plpgsql security invoker as $$
begin
  begin
    insert into public.leads (name, email, message)
    values ('Blocked', 'blocked@example.com', 'must not be stored directly');
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'RLS CHECK FAILED: anon direct lead insert was allowed';
end;
$$;

-- Customer-facing tables may be readable, but commercial and operational
-- fields must never be directly mutable by the customer role.
create or replace function pg_temp.assert_order_admin_update_blocked()
returns void language plpgsql security invoker as $$
begin
  begin
    update public.orders
    set total_amount = 1, status = 'delivered'
    where order_number = 'CD-TEST-A';
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'RLS CHECK FAILED: customer changed order amount/status';
end;
$$;

create or replace function pg_temp.assert_cross_customer_update_blocked()
returns void language plpgsql security invoker as $$
begin
  begin
    update public.customers
    set name = 'Compromised'
    where email = 'b@example.com';
  exception when insufficient_privilege then
    return;
  end;
  raise exception 'RLS CHECK FAILED: customer changed another profile';
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

-- Direct table writes are blocked; the field-whitelisted RPC is the only
-- public intake surface. The new row remains unreadable to anon.
select pg_temp.assert_direct_lead_insert_blocked();
select public.submit_public_intake(
  p_intake_type := 'contact',
  p_name := 'Anon Intake',
  p_email := 'intake@example.com',
  p_consent := true,
  p_source_entity_type := 'product',
  p_source_slug := 'test-product',
  p_source_label := 'Test Product'
);
select pg_temp.assert((select count(*) from public.leads) = 0, 'anon cannot read leads created by RPC');

reset role;

select pg_temp.assert(
  exists (
    select 1 from public.leads
    where email = 'intake@example.com'
      and source_type = 'product_inquiry'
      and status = 'new'
      and assigned_staff_id is null
      and metadata ->> 'source_slug' = 'test-product'
  ),
  'public intake RPC stores only a new unassigned CRM lead with source context'
);

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
select pg_temp.assert((select count(*) from public.cart_items) = 1,       'customer A sees own cart item');
update public.cart_items set unit_price_snapshot = 1, total_price_snapshot = 2
where id = 'dddd1111-0000-0000-0000-000000000001';
select pg_temp.assert_order_admin_update_blocked();
select pg_temp.assert_cross_customer_update_blocked();

reset role;

select pg_temp.assert(
  exists (
    select 1 from public.orders
    where order_number = 'CD-TEST-A'
      and total_amount = 100
      and status = 'pending_payment'
  ),
  'customer cannot change order amount or status'
);
select pg_temp.assert(
  exists (select 1 from public.customers where email = 'b@example.com' and name = 'Test B'),
  'customer cannot change another customer profile'
);
select pg_temp.assert(
  exists (select 1 from public.cart_items where id = 'dddd1111-0000-0000-0000-000000000001' and unit_price_snapshot = 100 and total_price_snapshot = 200),
  'customer cannot forge cart snapshot pricing'
);

-- ===========================================================================
-- CUSTOMER B checks — cross-tenant isolation
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);

select pg_temp.assert(not exists (select 1 from public.orders where order_number = 'CD-TEST-A'), 'customer B cannot see customer A order');
select pg_temp.assert((select count(*) from public.cart_items) = 0, 'customer B cannot see customer A cart items');

reset role;

-- ===========================================================================
-- PAYMENT ORCHESTRATION PRIVILEGE CHECKS
-- Financial state machines are callable by service_role only. Customer and
-- anon clients can observe their normalized rows through RLS but can never
-- manufacture an order, payment attempt, or provider callback.
-- ===========================================================================
select pg_temp.assert(
  not has_function_privilege(
    'anon',
    'public.create_payment_attempt(uuid,uuid,public.payment_provider,text)',
    'execute'
  ),
  'anon cannot create payment attempts'
);
select pg_temp.assert(
  not has_function_privilege(
    'authenticated',
    'public.create_payment_attempt(uuid,uuid,public.payment_provider,text)',
    'execute'
  ),
  'customers cannot create payment attempts directly'
);
select pg_temp.assert(
  not has_function_privilege(
    'authenticated',
    'public.apply_payment_event(uuid,text,text,public.payment_status,text,text,numeric,boolean,jsonb,text,text)',
    'execute'
  ),
  'customers cannot forge provider events'
);
select pg_temp.assert(
  has_function_privilege(
    'service_role',
    'public.create_payment_attempt(uuid,uuid,public.payment_provider,text)',
    'execute'
  ),
  'service role can orchestrate payment attempts'
);

-- All good — undo everything.
rollback;
