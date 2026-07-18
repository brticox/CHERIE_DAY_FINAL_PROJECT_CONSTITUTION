-- =============================================================================
-- CHERIE DAY — Customer self-service invariants (launch MVP: favorites,
-- address book, notifications, KVKK data requests).
--
-- Self-asserting: each check RAISEs EXCEPTION on failure. Wrapped in a
-- transaction and rolled back, so it is non-destructive. Simulates the
-- authenticated role with request.jwt.claims + `set role`, exactly like
-- PostgREST, to exercise RLS and the SECURITY INVOKER/DEFINER RPCs.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/customer_self_service.sql
-- =============================================================================
begin;

create or replace function pg_temp.assert(cond boolean, label text)
returns void language plpgsql as $$
begin
  if cond is distinct from true then
    raise exception 'ASSERTION FAILED: %', label;
  end if;
end $$;

-- Two auth identities exercise the real signup trigger; normalize ids.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ssa@example.com', '{"name":"Self A"}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ssb@example.com', '{"name":"Self B"}'::jsonb);

update public.customers set id = case auth_user_id
  when 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' then '11111111-1111-1111-1111-111111111111'::uuid
  when 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' then '22222222-2222-2222-2222-222222222222'::uuid
end
where auth_user_id in (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- ===========================================================================
-- CUSTOMER A — favorites, addresses, data requests, consent
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);
select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);

-- Favorites: duplicate save is a no-op (idempotent via unique constraint).
insert into public.favorites (customer_id, item_type, item_id)
  values ('11111111-1111-1111-1111-111111111111', 'product', 'aaaa0000-0000-0000-0000-0000000000f1')
  on conflict (customer_id, item_type, item_id) do nothing;
insert into public.favorites (customer_id, item_type, item_id)
  values ('11111111-1111-1111-1111-111111111111', 'product', 'aaaa0000-0000-0000-0000-0000000000f1')
  on conflict (customer_id, item_type, item_id) do nothing;
select pg_temp.assert((select count(*) from public.favorites) = 1, 'favorites: duplicate save deduplicated to 1');

-- Address book: two addresses, atomic single default shipping.
insert into public.customer_addresses (id, customer_id, type, full_name, city, district, address_line)
values
  ('addd0000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'delivery', 'Self A', 'İstanbul', 'Kadıköy', 'Adres 1'),
  ('addd0000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'delivery', 'Self A', 'İzmir', 'Çeşme', 'Adres 2');

select public.set_default_address('addd0000-0000-0000-0000-000000000001', 'shipping');
select public.set_default_address('addd0000-0000-0000-0000-000000000002', 'shipping');
select pg_temp.assert(
  (select count(*) from public.customer_addresses where is_default_shipping and deleted_at is null) = 1,
  'addresses: exactly one default shipping after reassignment');
select pg_temp.assert(
  (select is_default_shipping from public.customer_addresses where id = 'addd0000-0000-0000-0000-000000000002'),
  'addresses: latest set_default wins');

-- Soft delete promotes a remaining address to default.
select public.soft_delete_address('addd0000-0000-0000-0000-000000000002');
select pg_temp.assert(
  (select deleted_at is not null from public.customer_addresses where id = 'addd0000-0000-0000-0000-000000000002'),
  'addresses: soft delete sets deleted_at (row retained)');
select pg_temp.assert(
  (select is_default_shipping from public.customer_addresses where id = 'addd0000-0000-0000-0000-000000000001'),
  'addresses: default promoted to remaining address');
select pg_temp.assert(
  (select count(*) from public.customer_addresses where is_default_shipping and deleted_at is null) = 1,
  'addresses: still exactly one live default shipping');

-- KVKK data requests: idempotent (same open request id returned twice).
select pg_temp.assert(
  public.request_customer_data_action('export', null)
    = public.request_customer_data_action('export', null),
  'kvkk: repeat export request is idempotent');
select pg_temp.assert(
  (select count(*) from public.customer_data_requests where kind = 'export' and status in ('pending','in_review')) = 1,
  'kvkk: only one open export request');
select public.request_customer_data_action('deletion', null);
select pg_temp.assert(
  (select count(*) from public.customer_data_requests where kind = 'deletion' and status = 'pending') = 1,
  'kvkk: deletion request filed (as a request, not a delete)');

-- Marketing consent RPC is the only customer path to marketing_consent_at.
select public.set_marketing_consent(true);
select pg_temp.assert(
  (select marketing_consent_at is not null from public.customers where id = '11111111-1111-1111-1111-111111111111'),
  'kvkk: consent opt-in sets timestamp');
select public.set_marketing_consent(false);
select pg_temp.assert(
  (select marketing_consent_at is null from public.customers where id = '11111111-1111-1111-1111-111111111111'),
  'kvkk: consent opt-out clears timestamp');

-- Direct UPDATE of customers by the customer is blocked (no UPDATE policy):
-- the row is filtered, so 0 rows change and the guarded column is untouched.
update public.customers set marketing_consent_at = now()
  where id = '11111111-1111-1111-1111-111111111111';
select pg_temp.assert(
  (select marketing_consent_at is null from public.customers where id = '11111111-1111-1111-1111-111111111111'),
  'kvkk: direct customer UPDATE cannot forge consent');

reset role;

-- ===========================================================================
-- CUSTOMER B — cross-tenant isolation
-- ===========================================================================
set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);
select set_config('request.jwt.claim.sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true);

select pg_temp.assert((select count(*) from public.favorites) = 0, 'isolation: B cannot see A favorites');
select pg_temp.assert((select count(*) from public.customer_addresses) = 0, 'isolation: B cannot see A addresses');
select pg_temp.assert((select count(*) from public.customer_data_requests) = 0, 'isolation: B cannot see A data requests');

reset role;

do $$ begin raise notice 'customer_self_service.sql: all assertions passed'; end $$;

rollback;
