-- CHERIE DAY · Secure customization and persistent cart
-- Pricing and ownership are server-controlled. Clients retain read-only access
-- to their authenticated cart through RLS; all writes go through server routes.

alter table public.cart_items
  add column if not exists product_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists price_breakdown_json jsonb not null default '{}'::jsonb,
  add column if not exists total_price_snapshot numeric(12,2),
  add column if not exists removed_at timestamptz;

alter table public.cart_items
  drop constraint if exists cart_items_quantity_safe;
alter table public.cart_items
  add constraint cart_items_quantity_safe check (quantity between 1 and 10000);

create unique index if not exists one_active_cart_per_customer
  on public.carts (customer_id)
  where customer_id is not null and status = 'active';
create unique index if not exists one_active_cart_per_guest
  on public.carts (anonymous_token_hash)
  where anonymous_token_hash is not null and status = 'active';

create table if not exists public.customer_uploads (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete cascade,
  anonymous_token_hash text,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now(),
  constraint customer_upload_owner check (
    customer_id is not null or anonymous_token_hash is not null
  )
);
create index if not exists customer_uploads_cart_idx on public.customer_uploads (cart_id);

alter table public.customer_uploads enable row level security;

-- The old policy let customers submit arbitrary snapshot prices. Reads remain
-- available through the separate select policy; mutations are server-only.
drop policy if exists cust_write_cart_items on public.cart_items;

revoke all on public.customer_uploads from anon, authenticated;
grant select on public.customer_uploads to authenticated;
create policy customer_read_own_uploads on public.customer_uploads
  for select to authenticated
  using (customer_id = public.current_customer_id());

create policy staff_read_customer_uploads on public.customer_uploads
  for select to authenticated
  using (public.has_staff_role(array['admin','order_operations','proof_designer','support_agent']));
