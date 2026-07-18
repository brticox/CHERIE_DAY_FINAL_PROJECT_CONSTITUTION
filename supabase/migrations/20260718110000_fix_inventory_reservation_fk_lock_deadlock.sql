-- `order_items.variant_id` holds a foreign-key KEY SHARE lock before its
-- statement trigger runs. Upgrading that lock to FOR UPDATE in concurrent
-- reservations creates a deadlock cycle. NO KEY UPDATE still serializes stock
-- changes while remaining compatible with the foreign-key lock.
create or replace function public.release_expired_variant_reservations(
  p_variant_id uuid
) returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_released integer := 0;
begin
  perform 1 from public.product_variants
  where id = p_variant_id
  for no key update;
  if not found then return 0; end if;

  with released as (
    update public.inventory_reservations
    set status = 'expired', released_at = now(), updated_at = now()
    where variant_id = p_variant_id
      and status = 'reserved'
      and expires_at <= now()
    returning quantity
  )
  select coalesce(sum(quantity), 0)::integer into v_released from released;

  if v_released > 0 then
    update public.product_variants
    set stock_quantity = coalesce(stock_quantity, 0) + v_released
    where id = p_variant_id;
  end if;
  return v_released;
end;
$$;

create or replace function public.reserve_new_order_items()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item record;
  v_stock integer;
  v_expiry timestamptz;
begin
  if exists (
    select 1
    from new_order_items ni
    join public.products p on p.id = ni.product_id
    where p.stock_mode = 'in_stock' and ni.variant_id is null
  ) then
    raise exception 'tracked inventory requires a variant'
      using errcode = '23514';
  end if;

  for v_item in
    select ni.order_id, ni.variant_id, sum(ni.quantity)::integer as quantity
    from new_order_items ni
    join public.products p on p.id = ni.product_id
    where p.stock_mode = 'in_stock' and ni.variant_id is not null
    group by ni.order_id, ni.variant_id
    order by ni.variant_id, ni.order_id
  loop
    perform 1
    from public.product_variants v
    where v.id = v_item.variant_id
      and v.status = 'active'
    for no key update;
    if not found then
      raise exception 'tracked variant is unavailable' using errcode = '23514';
    end if;

    perform public.release_expired_variant_reservations(v_item.variant_id);

    update public.product_variants
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_item.variant_id
      and stock_quantity is not null
      and stock_quantity >= v_item.quantity
    returning stock_quantity into v_stock;
    if not found then
      raise exception 'insufficient inventory for variant %', v_item.variant_id
        using errcode = '23514';
    end if;

    select greatest(coalesce(cs.expires_at, now()), now() + interval '60 minutes')
    into v_expiry
    from public.orders o
    left join public.checkout_sessions cs on cs.id = o.checkout_session_id
    where o.id = v_item.order_id;
    if v_expiry is null then
      raise exception 'checkout expiry is required for inventory reservation'
        using errcode = '23514';
    end if;

    insert into public.inventory_reservations(
      order_id, checkout_session_id, variant_id, quantity, expires_at
    )
    select o.id, o.checkout_session_id, v_item.variant_id, v_item.quantity, v_expiry
    from public.orders o
    where o.id = v_item.order_id and o.checkout_session_id is not null;
    if not found then
      raise exception 'checkout order is required for inventory reservation'
        using errcode = '23514';
    end if;
  end loop;
  return null;
end;
$$;

revoke all on function public.release_expired_variant_reservations(uuid)
  from public, anon, authenticated;
revoke all on function public.reserve_new_order_items()
  from public, anon, authenticated;
