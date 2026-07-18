-- ---------------------------------------------------------------------------
-- Adres Defterim (customer address book) — schema completion.
--
-- Extends the existing public.customer_addresses table (migration 0006) so a
-- signed-in customer can maintain a reusable address book with a friendly
-- title, a delivery note, soft deletion, and independent default-shipping /
-- default-billing selection. Orders continue to store IMMUTABLE JSON snapshots
-- (orders.delivery_address_snapshot / billing_address_snapshot), so editing or
-- deleting a saved address can never rewrite a historical order.
--
-- Purely additive: existing columns (type, is_default) are left intact for
-- backward compatibility; new code uses the flags below. RLS is unchanged —
-- the table-level cust_select_own / cust_insert_own / cust_update_own policies
-- (migration 0012) already cover the new columns, and soft delete is an UPDATE
-- of deleted_at (allowed by cust_update_own), so no customer hard-delete path
-- is opened.
--
-- ROLLBACK NOTES:
--   drop function if exists public.soft_delete_address(uuid);
--   drop function if exists public.set_default_address(uuid, text);
--   drop index if exists public.customer_addresses_default_billing_uidx;
--   drop index if exists public.customer_addresses_default_shipping_uidx;
--   alter table public.customer_addresses
--     drop column if exists deleted_at,
--     drop column if exists is_default_billing,
--     drop column if exists is_default_shipping,
--     drop column if exists notes,
--     drop column if exists label;
-- ---------------------------------------------------------------------------

alter table public.customer_addresses
  add column if not exists label text,
  add column if not exists notes text,
  add column if not exists is_default_shipping boolean not null default false,
  add column if not exists is_default_billing boolean not null default false,
  add column if not exists deleted_at timestamptz;

-- At most one default shipping / billing address per customer (soft-deleted
-- rows excluded). Enforced at the database, not just the UI.
create unique index if not exists customer_addresses_default_shipping_uidx
  on public.customer_addresses (customer_id)
  where is_default_shipping and deleted_at is null;

create unique index if not exists customer_addresses_default_billing_uidx
  on public.customer_addresses (customer_id)
  where is_default_billing and deleted_at is null;

-- Only surface live rows to typical reads.
create index if not exists customer_addresses_customer_live_idx
  on public.customer_addresses (customer_id)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- set_default_address(address_id, kind) — atomically move the single default
-- shipping/billing flag to one address. SECURITY INVOKER: it runs under the
-- caller's RLS, so a customer can only ever affect their own rows, and
-- current_customer_id() resolves to the caller. Two statements in one function
-- body keep the switch transactional, avoiding a transient two-default state
-- that the partial unique index would otherwise reject.
-- ---------------------------------------------------------------------------
create or replace function public.set_default_address(p_address_id uuid, p_kind text)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_customer uuid := public.current_customer_id();
  v_owned int;
begin
  if v_customer is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_kind not in ('shipping', 'billing') then
    raise exception 'invalid_kind' using errcode = '22023';
  end if;

  select count(*) into v_owned
  from public.customer_addresses
  where id = p_address_id and customer_id = v_customer and deleted_at is null;
  if v_owned = 0 then
    raise exception 'address_not_found' using errcode = 'P0002';
  end if;

  if p_kind = 'shipping' then
    update public.customer_addresses
      set is_default_shipping = false, updated_at = now()
      where customer_id = v_customer and is_default_shipping and id <> p_address_id;
    update public.customer_addresses
      set is_default_shipping = true, updated_at = now()
      where customer_id = v_customer and id = p_address_id and deleted_at is null;
  else
    update public.customer_addresses
      set is_default_billing = false, updated_at = now()
      where customer_id = v_customer and is_default_billing and id <> p_address_id;
    update public.customer_addresses
      set is_default_billing = true, updated_at = now()
      where customer_id = v_customer and id = p_address_id and deleted_at is null;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- soft_delete_address(address_id) — soft-delete one of the caller's addresses
-- and, if it held a default flag, promote the most recently updated remaining
-- live address to that default so the customer is never left without one.
-- SECURITY INVOKER — RLS restricts every statement to the caller's rows.
-- ---------------------------------------------------------------------------
create or replace function public.soft_delete_address(p_address_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_customer uuid := public.current_customer_id();
  v_was_shipping boolean;
  v_was_billing boolean;
  v_next uuid;
begin
  if v_customer is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select is_default_shipping, is_default_billing
    into v_was_shipping, v_was_billing
  from public.customer_addresses
  where id = p_address_id and customer_id = v_customer and deleted_at is null;
  if not found then
    raise exception 'address_not_found' using errcode = 'P0002';
  end if;

  update public.customer_addresses
    set deleted_at = now(),
        is_default_shipping = false,
        is_default_billing = false,
        updated_at = now()
    where id = p_address_id and customer_id = v_customer;

  if v_was_shipping then
    select id into v_next from public.customer_addresses
      where customer_id = v_customer and deleted_at is null
      order by updated_at desc limit 1;
    if v_next is not null then
      update public.customer_addresses set is_default_shipping = true, updated_at = now()
        where id = v_next;
    end if;
  end if;

  if v_was_billing then
    select id into v_next from public.customer_addresses
      where customer_id = v_customer and deleted_at is null
      order by updated_at desc limit 1;
    if v_next is not null then
      update public.customer_addresses set is_default_billing = true, updated_at = now()
        where id = v_next;
    end if;
  end if;
end;
$$;

revoke all on function public.set_default_address(uuid, text) from public;
revoke all on function public.soft_delete_address(uuid) from public;
grant execute on function public.set_default_address(uuid, text) to authenticated;
grant execute on function public.soft_delete_address(uuid) to authenticated;
