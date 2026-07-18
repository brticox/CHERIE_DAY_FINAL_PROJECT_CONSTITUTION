create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  delta integer not null check (delta <> 0),
  quantity_before integer not null check (quantity_before >= 0),
  quantity_after integer not null check (quantity_after >= 0),
  reason text not null check (reason in ('restock', 'sale_correction', 'damage', 'count', 'return', 'other')),
  note text,
  staff_user_id uuid not null references public.staff_users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint inventory_movement_math check (quantity_after = quantity_before + delta),
  constraint inventory_movement_note_length check (note is null or length(note) <= 1000)
);

create index inventory_movements_variant_created_idx
  on public.inventory_movements (variant_id, created_at desc);
create index inventory_movements_created_idx
  on public.inventory_movements (created_at desc);
create index if not exists product_variants_title_trgm_idx
  on public.product_variants using gin (title gin_trgm_ops);
create index if not exists product_variants_sku_trgm_idx
  on public.product_variants using gin (sku gin_trgm_ops)
  where sku is not null;

alter table public.inventory_movements enable row level security;

create policy inventory_movements_staff_read
on public.inventory_movements for select to authenticated
using ((select public.has_staff_role(array['product_editor', 'commerce_manager', 'admin'])));

create policy inventory_movements_manager_insert
on public.inventory_movements for insert to authenticated
with check (
  (select public.has_staff_role(array['commerce_manager', 'admin']))
  and staff_user_id = (select public.current_staff_id())
);

grant select, insert on public.inventory_movements to authenticated;
grant all on public.inventory_movements to service_role;

create or replace function public.admin_adjust_inventory(
  p_variant_id uuid,
  p_delta integer,
  p_reason text,
  p_note text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_staff uuid;
  v_movement uuid;
  v_before integer;
  v_after integer;
  v_stock_mode public.stock_mode;
begin
  if not (select public.has_staff_role(array['commerce_manager', 'admin'])) then
    raise exception 'permission denied' using errcode = '42501';
  end if;
  if p_delta is null or p_delta = 0 or abs(p_delta) > 100000 then
    raise exception 'invalid stock delta' using errcode = '23514';
  end if;
  if p_reason not in ('restock', 'sale_correction', 'damage', 'count', 'return', 'other') then
    raise exception 'invalid stock reason' using errcode = '23514';
  end if;
  if length(coalesce(p_note, '')) > 1000 then
    raise exception 'stock note too long' using errcode = '22001';
  end if;

  v_staff := public.current_staff_id();
  select coalesce(v.stock_quantity, 0), p.stock_mode
    into v_before, v_stock_mode
  from public.product_variants v
  join public.products p on p.id = v.product_id
  where v.id = p_variant_id
  for update of v;

  if not found then
    raise exception 'variant not found' using errcode = 'P0002';
  end if;
  if v_stock_mode in ('made_to_order', 'unavailable') then
    raise exception 'stock is not tracked for this product mode' using errcode = '23514';
  end if;

  v_after := v_before + p_delta;
  if v_after < 0 then
    raise exception 'stock cannot be negative' using errcode = '23514';
  end if;

  update public.product_variants
  set stock_quantity = v_after
  where id = p_variant_id;

  insert into public.inventory_movements (
    variant_id, delta, quantity_before, quantity_after, reason, note, staff_user_id
  ) values (
    p_variant_id, p_delta, v_before, v_after, p_reason, nullif(trim(p_note), ''), v_staff
  ) returning id into v_movement;

  insert into public.audit_log (staff_user_id, action, entity_type, entity_id, diff)
  values (
    v_staff,
    'inventory.adjusted',
    'product_variant',
    p_variant_id,
    jsonb_build_object(
      'movement_id', v_movement,
      'quantity_before', v_before,
      'delta', p_delta,
      'quantity_after', v_after,
      'reason', p_reason
    )
  );

  return v_movement;
end;
$$;

revoke all on function public.admin_adjust_inventory(uuid, integer, text, text)
from public, anon;
grant execute on function public.admin_adjust_inventory(uuid, integer, text, text)
to authenticated;
