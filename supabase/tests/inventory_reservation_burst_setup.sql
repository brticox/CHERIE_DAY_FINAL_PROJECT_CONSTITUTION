-- Disposable localhost fixture for concurrent reservation contention. The
-- verifier removes every row it creates after asserting the final ledger.
insert into public.customers(id, name, email) values
  ('71000000-0000-4000-8000-000000000099', 'Reservation Burst', 'reservation-burst@test.local');
insert into public.products(id, name, slug, stock_mode, status, base_price, behavior_type) values
  ('72000000-0000-4000-8000-000000000099', 'Reservation Burst', 'p0-reservation-burst', 'in_stock', 'published', 100, 'cart_enabled');
insert into public.product_variants(id, product_id, title, sku, stock_quantity, status) values
  ('73000000-0000-4000-8000-000000000099', '72000000-0000-4000-8000-000000000099', 'Reservation Burst', 'P0-RES-BURST', 25, 'active');

insert into public.carts(id, customer_id, status, currency)
select
  ('74000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  '71000000-0000-4000-8000-000000000099',
  'converted',
  'TRY'
from generate_series(1, 100) as n;

insert into public.checkout_sessions(id, customer_id, cart_id, status, total_amount, expires_at)
select
  ('75000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  '71000000-0000-4000-8000-000000000099',
  ('74000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'open',
  100,
  now() + interval '1 hour'
from generate_series(1, 100) as n;

insert into public.orders(id, order_number, customer_id, checkout_session_id, total_amount)
select
  ('76000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'P0-RES-BURST-' || n,
  '71000000-0000-4000-8000-000000000099',
  ('75000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  100
from generate_series(1, 100) as n;
