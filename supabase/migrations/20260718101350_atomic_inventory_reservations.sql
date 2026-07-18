-- Atomic inventory reservations. `product_variants.stock_quantity` is the
-- immediately sellable quantity: a reservation decrements it in the same
-- transaction that creates order_items; payment consumes the hold without a
-- second decrement; expiry/cancellation returns it exactly once.

create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  checkout_session_id uuid not null references public.checkout_sessions(id) on delete restrict,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0 and quantity <= 10000),
  status text not null default 'reserved'
    check (status in ('reserved','consumed','released','expired','conflict')),
  reserved_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  released_at timestamptz,
  conflict_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, variant_id),
  constraint inventory_reservation_terminal_times check (
    (status <> 'consumed' or consumed_at is not null)
    and (status not in ('released','expired') or released_at is not null)
    and (status <> 'conflict' or conflict_reason is not null)
  )
);

create index inventory_reservations_variant_status_expiry_idx
  on public.inventory_reservations(variant_id, status, expires_at);
create index inventory_reservations_checkout_idx
  on public.inventory_reservations(checkout_session_id, status);
create index inventory_reservations_order_idx
  on public.inventory_reservations(order_id, status);

alter table public.inventory_reservations enable row level security;

create policy inventory_reservations_staff_read
on public.inventory_reservations for select to authenticated
using ((select public.has_staff_role(array[
  'product_editor','commerce_manager','order_operations','operations','admin'
])));

grant select on public.inventory_reservations to authenticated;
grant all on public.inventory_reservations to service_role;
revoke all on public.inventory_reservations from anon;

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
  for update;
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
    for update;
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

drop trigger if exists trg_reserve_new_order_items on public.order_items;
create trigger trg_reserve_new_order_items
after insert on public.order_items
referencing new table as new_order_items
for each statement execute function public.reserve_new_order_items();

create or replace function public.consume_paid_inventory_reservations()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation public.inventory_reservations%rowtype;
  v_conflicts integer := 0;
begin
  if new.status <> 'paid' or old.status = 'paid' then return new; end if;

  for v_reservation in
    select r.*
    from public.inventory_reservations r
    where r.order_id = new.order_id
    order by r.variant_id
    for update
  loop
    perform 1 from public.product_variants
    where id = v_reservation.variant_id
    for update;

    if v_reservation.status = 'reserved' then
      update public.inventory_reservations
      set status = 'consumed', consumed_at = now(), updated_at = now()
      where id = v_reservation.id;
    elsif v_reservation.status in ('expired','released') then
      update public.product_variants
      set stock_quantity = stock_quantity - v_reservation.quantity
      where id = v_reservation.variant_id
        and stock_quantity is not null
        and stock_quantity >= v_reservation.quantity;
      if found then
        update public.inventory_reservations
        set status = 'consumed', consumed_at = now(), updated_at = now(),
            conflict_reason = null
        where id = v_reservation.id;
      else
        update public.inventory_reservations
        set status = 'conflict', updated_at = now(),
            conflict_reason = 'paid_after_inventory_release'
        where id = v_reservation.id;
        v_conflicts := v_conflicts + 1;
      end if;
    end if;
  end loop;

  if v_conflicts > 0 then
    insert into public.financial_audit_log(
      action, severity, actor_type, order_id, payment_id, correlation_id, metadata
    ) values (
      'paid_inventory_conflict','critical','system',new.order_id,new.id,
      coalesce(new.correlation_id, gen_random_uuid()),
      jsonb_build_object('conflict_count', v_conflicts)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_consume_paid_inventory_reservations on public.payments;
create trigger trg_consume_paid_inventory_reservations
after update of status on public.payments
for each row execute function public.consume_paid_inventory_reservations();

create or replace function public.release_cancelled_order_inventory()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation public.inventory_reservations%rowtype;
begin
  if new.status <> 'cancelled' or old.status = 'cancelled' or new.payment_status = 'paid' then
    return new;
  end if;
  for v_reservation in
    select r.* from public.inventory_reservations r
    where r.order_id = new.id and r.status = 'reserved'
    order by r.variant_id
    for update
  loop
    perform 1 from public.product_variants
    where id = v_reservation.variant_id
    for update;
    update public.product_variants
    set stock_quantity = coalesce(stock_quantity, 0) + v_reservation.quantity
    where id = v_reservation.variant_id;
    update public.inventory_reservations
    set status = 'released', released_at = now(), updated_at = now()
    where id = v_reservation.id and status = 'reserved';
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_release_cancelled_order_inventory on public.orders;
create trigger trg_release_cancelled_order_inventory
after update of status on public.orders
for each row execute function public.release_cancelled_order_inventory();

create or replace function public.release_expired_inventory_reservations(
  p_batch_size integer default 500
) returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_variant uuid;
  v_total integer := 0;
begin
  p_batch_size := greatest(1, least(p_batch_size, 5000));
  for v_variant in
    select distinct variant_id
    from public.inventory_reservations
    where status = 'reserved' and expires_at <= now()
    order by variant_id
    limit p_batch_size
  loop
    v_total := v_total + public.release_expired_variant_reservations(v_variant);
  end loop;
  return v_total;
end;
$$;

revoke all on function public.release_expired_variant_reservations(uuid)
  from public, anon, authenticated;
revoke all on function public.reserve_new_order_items()
  from public, anon, authenticated;
revoke all on function public.consume_paid_inventory_reservations()
  from public, anon, authenticated;
revoke all on function public.release_cancelled_order_inventory()
  from public, anon, authenticated;
revoke all on function public.release_expired_inventory_reservations(integer)
  from public, anon, authenticated;
grant execute on function public.release_expired_inventory_reservations(integer)
  to service_role;
