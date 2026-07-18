-- Atomic inventory reservation verification. Disposable/local database only.
begin;

create function pg_temp.assert_true(condition boolean, label text)
returns void language plpgsql as $$
begin
  if not coalesce(condition, false) then
    raise exception 'INVENTORY RESERVATION CHECK FAILED: %', label;
  end if;
  raise notice 'ok: %', label;
end
$$;

insert into public.customers(id,name,email) values
  ('71000000-0000-0000-0000-000000000001','Reservation Customer','reservation@test.local');
insert into public.products(id,name,slug,stock_mode,status,base_price,behavior_type) values
  ('72000000-0000-0000-0000-000000000001','Tracked','p0-tracked','in_stock','published',100,'cart_enabled'),
  ('72000000-0000-0000-0000-000000000002','Made','p0-made','made_to_order','published',100,'cart_enabled');
insert into public.product_variants(id,product_id,title,sku,stock_quantity,status) values
  ('73000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001','Tracked','P0-TRACKED',2,'active'),
  ('73000000-0000-0000-0000-000000000002','72000000-0000-0000-0000-000000000001','Cancellation','P0-CANCEL',5,'active'),
  ('73000000-0000-0000-0000-000000000003','72000000-0000-0000-0000-000000000001','Expiry','P0-EXPIRY',5,'active'),
  ('73000000-0000-0000-0000-000000000004','72000000-0000-0000-0000-000000000002','Made','P0-MADE',null,'active');

insert into public.carts(id,customer_id,status,currency) values
  ('74000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','active','TRY'),
  ('74000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000001','converted','TRY'),
  ('74000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000001','converted','TRY'),
  ('74000000-0000-0000-0000-000000000004','71000000-0000-0000-0000-000000000001','converted','TRY'),
  ('74000000-0000-0000-0000-000000000005','71000000-0000-0000-0000-000000000001','converted','TRY');
insert into public.checkout_sessions(id,customer_id,cart_id,status,total_amount,expires_at) values
  ('75000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001','74000000-0000-0000-0000-000000000001','open',200,now()+interval '1 hour'),
  ('75000000-0000-0000-0000-000000000002','71000000-0000-0000-0000-000000000001','74000000-0000-0000-0000-000000000002','open',100,now()+interval '1 hour'),
  ('75000000-0000-0000-0000-000000000003','71000000-0000-0000-0000-000000000001','74000000-0000-0000-0000-000000000003','open',200,now()+interval '1 hour'),
  ('75000000-0000-0000-0000-000000000004','71000000-0000-0000-0000-000000000001','74000000-0000-0000-0000-000000000004','open',100,now()+interval '1 hour'),
  ('75000000-0000-0000-0000-000000000005','71000000-0000-0000-0000-000000000001','74000000-0000-0000-0000-000000000005','open',100,now()+interval '1 hour');
insert into public.orders(id,order_number,customer_id,checkout_session_id,total_amount) values
  ('76000000-0000-0000-0000-000000000001','P0-RES-1','71000000-0000-0000-0000-000000000001','75000000-0000-0000-0000-000000000001',200),
  ('76000000-0000-0000-0000-000000000002','P0-RES-2','71000000-0000-0000-0000-000000000001','75000000-0000-0000-0000-000000000002',100),
  ('76000000-0000-0000-0000-000000000003','P0-CANCEL','71000000-0000-0000-0000-000000000001','75000000-0000-0000-0000-000000000003',200),
  ('76000000-0000-0000-0000-000000000004','P0-EXPIRY','71000000-0000-0000-0000-000000000001','75000000-0000-0000-0000-000000000004',100),
  ('76000000-0000-0000-0000-000000000005','P0-MADE','71000000-0000-0000-0000-000000000001','75000000-0000-0000-0000-000000000005',100);

insert into public.order_items(order_id,product_id,variant_id,quantity,unit_price,total_price)
values('76000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001',2,100,200);
select pg_temp.assert_true(
  (select stock_quantity=0 from public.product_variants where id='73000000-0000-0000-0000-000000000001'),
  'reservation atomically removes sellable stock'
);
select pg_temp.assert_true(
  (select status='reserved' and quantity=2 from public.inventory_reservations where order_id='76000000-0000-0000-0000-000000000001'),
  'reservation ledger records the held quantity'
);

do $$
begin
  begin
    insert into public.order_items(order_id,product_id,variant_id,quantity,unit_price,total_price)
    values('76000000-0000-0000-0000-000000000002','72000000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001',1,100,100);
  exception when check_violation then return;
  end;
  raise exception 'INVENTORY RESERVATION CHECK FAILED: competing order oversold stock';
end
$$;
select pg_temp.assert_true(
  (select stock_quantity=0 from public.product_variants where id='73000000-0000-0000-0000-000000000001'),
  'failed competing reservation leaves stock unchanged'
);

insert into public.payments(
  id,order_id,checkout_session_id,provider,status,amount,amount_minor,currency,correlation_id
) values(
  '77000000-0000-0000-0000-000000000001','76000000-0000-0000-0000-000000000001',
  '75000000-0000-0000-0000-000000000001','paytr','pending',200,20000,'TRY',
  '78000000-0000-0000-0000-000000000001'
);
update public.payments set status='paid' where id='77000000-0000-0000-0000-000000000001';
select pg_temp.assert_true(
  (select status='consumed' and consumed_at is not null from public.inventory_reservations where order_id='76000000-0000-0000-0000-000000000001'),
  'paid transition consumes the hold without a second decrement'
);
update public.payments set status='paid' where id='77000000-0000-0000-0000-000000000001';
select pg_temp.assert_true(
  (select stock_quantity=0 from public.product_variants where id='73000000-0000-0000-0000-000000000001'),
  'replayed paid state is inventory-idempotent'
);

insert into public.order_items(order_id,product_id,variant_id,quantity,unit_price,total_price)
values('76000000-0000-0000-0000-000000000003','72000000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000002',2,100,200);
select pg_temp.assert_true(
  (select stock_quantity=3 from public.product_variants where id='73000000-0000-0000-0000-000000000002'),
  'cancellable order holds stock'
);
update public.orders set status='cancelled' where id='76000000-0000-0000-0000-000000000003';
select pg_temp.assert_true(
  (select stock_quantity=5 from public.product_variants where id='73000000-0000-0000-0000-000000000002'),
  'unpaid cancellation releases stock exactly once'
);
select pg_temp.assert_true(
  (select status='released' from public.inventory_reservations where order_id='76000000-0000-0000-0000-000000000003'),
  'cancellation records a terminal release state'
);

insert into public.order_items(order_id,product_id,variant_id,quantity,unit_price,total_price)
values('76000000-0000-0000-0000-000000000004','72000000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000003',1,100,100);
update public.inventory_reservations set expires_at=now()-interval '1 minute'
where order_id='76000000-0000-0000-0000-000000000004';
select public.release_expired_inventory_reservations(100);
select pg_temp.assert_true(
  (select stock_quantity=5 from public.product_variants where id='73000000-0000-0000-0000-000000000003'),
  'expiry returns stock exactly once'
);
insert into public.payments(
  id,order_id,checkout_session_id,provider,status,amount,amount_minor,currency,correlation_id
) values(
  '77000000-0000-0000-0000-000000000004','76000000-0000-0000-0000-000000000004',
  '75000000-0000-0000-0000-000000000004','paytr','pending',100,10000,'TRY',
  '78000000-0000-0000-0000-000000000004'
);
update public.payments set status='paid' where id='77000000-0000-0000-0000-000000000004';
select pg_temp.assert_true(
  (select status='consumed' from public.inventory_reservations where order_id='76000000-0000-0000-0000-000000000004'),
  'late paid callback atomically reacquires available stock'
);
select pg_temp.assert_true(
  (select stock_quantity=4 from public.product_variants where id='73000000-0000-0000-0000-000000000003'),
  'late paid reacquisition decrements once'
);

insert into public.order_items(order_id,product_id,variant_id,quantity,unit_price,total_price)
values('76000000-0000-0000-0000-000000000005','72000000-0000-0000-0000-000000000002','73000000-0000-0000-0000-000000000004',1,100,100);
select pg_temp.assert_true(
  not exists(select 1 from public.inventory_reservations where order_id='76000000-0000-0000-0000-000000000005'),
  'made-to-order products do not create false finite-stock holds'
);

set local role anon;
select pg_temp.assert_true(
  not has_table_privilege('anon','public.inventory_reservations','select'),
  'anonymous users cannot read reservation records'
);
select pg_temp.assert_true(
  not has_function_privilege('anon','public.release_expired_inventory_reservations(integer)','execute'),
  'anonymous users cannot release inventory'
);
reset role;

rollback;
