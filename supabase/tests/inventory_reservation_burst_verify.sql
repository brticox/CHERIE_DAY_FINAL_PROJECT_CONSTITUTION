create function pg_temp.assert_true(condition boolean, label text)
returns void language plpgsql as $$
begin
  if not coalesce(condition, false) then
    raise exception 'INVENTORY BURST CHECK FAILED: %', label;
  end if;
  raise notice 'ok: %', label;
end
$$;

select pg_temp.assert_true(
  (select stock_quantity = 0 from public.product_variants where id = '73000000-0000-4000-8000-000000000099'),
  '100 simultaneous holds cannot drive stock below zero'
);
select pg_temp.assert_true(
  (select count(*) = 25 and coalesce(sum(quantity), 0) = 25
   from public.inventory_reservations
   where variant_id = '73000000-0000-4000-8000-000000000099' and status = 'reserved'),
  'exactly the available 25 units are reserved once'
);
select pg_temp.assert_true(
  (select count(*) = 25
   from public.order_items
   where product_id = '72000000-0000-4000-8000-000000000099'),
  'rejected concurrent inserts roll back their order item as well'
);

delete from public.inventory_reservations where variant_id = '73000000-0000-4000-8000-000000000099';
delete from public.order_items where product_id = '72000000-0000-4000-8000-000000000099';
delete from public.orders where customer_id = '71000000-0000-4000-8000-000000000099';
delete from public.checkout_sessions where customer_id = '71000000-0000-4000-8000-000000000099';
delete from public.carts where customer_id = '71000000-0000-4000-8000-000000000099';
delete from public.product_variants where id = '73000000-0000-4000-8000-000000000099';
delete from public.products where id = '72000000-0000-4000-8000-000000000099';
delete from public.customers where id = '71000000-0000-4000-8000-000000000099';
