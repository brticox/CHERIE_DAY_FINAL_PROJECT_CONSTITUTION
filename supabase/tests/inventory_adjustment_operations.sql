-- Inventory adjustment verification. Run only on a disposable/local database.
begin;

create function pg_temp.assert_true(condition boolean, label text)
returns void language plpgsql as $$
begin
  if not condition then raise exception 'INVENTORY CHECK FAILED: %', label; end if;
  raise notice 'ok: %', label;
end
$$;

insert into auth.users (id, email, raw_user_meta_data) values
  ('cb000000-0000-0000-0000-000000000001', 'stock-editor@test.local', '{}'),
  ('cb000000-0000-0000-0000-000000000002', 'stock-manager@test.local', '{}');

insert into public.staff_users (id, auth_user_id, name, role) values
  ('db000000-0000-0000-0000-000000000001', 'cb000000-0000-0000-0000-000000000001', 'Stock Editor', 'product_editor'),
  ('db000000-0000-0000-0000-000000000002', 'cb000000-0000-0000-0000-000000000002', 'Stock Manager', 'commerce_manager');

insert into public.products (id, name, slug, stock_mode) values
  ('eb000000-0000-0000-0000-000000000001', 'Tracked product', 'tracked-product', 'in_stock'),
  ('eb000000-0000-0000-0000-000000000002', 'Made product', 'made-product', 'made_to_order');

insert into public.product_variants (id, product_id, title, sku, stock_quantity) values
  ('fb000000-0000-0000-0000-000000000001', 'eb000000-0000-0000-0000-000000000001', 'Tracked variant', 'TRACK-1', 10),
  ('fb000000-0000-0000-0000-000000000002', 'eb000000-0000-0000-0000-000000000002', 'Made variant', 'MADE-1', null);

select pg_temp.assert_true(
  not has_function_privilege('anon', 'public.admin_adjust_inventory(uuid,integer,text,text)', 'execute'),
  'anon cannot execute inventory adjustment'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'cb000000-0000-0000-0000-000000000001', true);
do $$
begin
  begin
    perform public.admin_adjust_inventory('fb000000-0000-0000-0000-000000000001', 5, 'restock', 'denied');
  exception when insufficient_privilege then return;
  end;
  raise exception 'INVENTORY CHECK FAILED: product editor changed stock';
end
$$;

select set_config('request.jwt.claim.sub', 'cb000000-0000-0000-0000-000000000002', true);
select public.admin_adjust_inventory('fb000000-0000-0000-0000-000000000001', 5, 'restock', 'Counted delivery');
select pg_temp.assert_true(
  (select stock_quantity = 15 from public.product_variants where id = 'fb000000-0000-0000-0000-000000000001'),
  'manager atomically increases tracked stock'
);
select pg_temp.assert_true(
  (select quantity_before = 10 and delta = 5 and quantity_after = 15
   from public.inventory_movements where variant_id = 'fb000000-0000-0000-0000-000000000001'),
  'movement records before, delta, and after quantities'
);

do $$
begin
  begin
    perform public.admin_adjust_inventory('fb000000-0000-0000-0000-000000000001', -16, 'damage', 'invalid');
  exception when check_violation then return;
  end;
  raise exception 'INVENTORY CHECK FAILED: negative stock accepted';
end
$$;

do $$
begin
  begin
    perform public.admin_adjust_inventory('fb000000-0000-0000-0000-000000000002', 1, 'restock', 'invalid model');
  exception when check_violation then return;
  end;
  raise exception 'INVENTORY CHECK FAILED: made-to-order stock accepted';
end
$$;

reset role;
select pg_temp.assert_true(
  (select count(*) = 1 from public.audit_log
   where action = 'inventory.adjusted' and entity_id = 'fb000000-0000-0000-0000-000000000001'),
  'successful stock adjustment keeps an audit record'
);

rollback;
