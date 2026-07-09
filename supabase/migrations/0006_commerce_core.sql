-- =============================================================================
-- CHERIE DAY — 0006 · Commerce core
-- Customer addresses + Cart/Checkout (F) + Orders/Payments (G) +
-- Fulfillment/Proofing (H). Turkey-only, TRY-only (docs/08, docs/43, docs/24).
-- =============================================================================

-- ---- Customer addresses (part of module I; needed by checkout) -------------
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  type text not null default 'delivery' check (type in ('delivery', 'billing')),
  full_name text not null,
  phone text,
  country text not null default 'TR',             -- MVP locked to Turkey (docs/24)
  city text,
  district text,
  neighborhood text,
  address_line text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customer_addresses_customer_idx on public.customer_addresses (customer_id);

-- ---- Shipping methods ------------------------------------------------------
create table public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.shipping_method_type not null default 'cargo',
  city_scope text[],
  base_price numeric(12,2) not null default 0,
  status public.content_status not null default 'published',
  sort_order int not null default 0
);

-- ---- F. Cart / checkout ----------------------------------------------------
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete cascade,
  anonymous_token_hash text,                      -- guest/pre-login cart
  status public.cart_status not null default 'active',
  currency text not null default 'TRY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  digital_product_id uuid references public.digital_products (id) on delete set null,
  quantity int not null default 1,
  personalization_json jsonb,
  selected_addons_json jsonb,
  uploaded_file_ids uuid[] not null default '{}',
  unit_price_snapshot numeric(12,2),
  requires_proof boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cart_items_cart_idx on public.cart_items (cart_id);

create table public.checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  cart_id uuid references public.carts (id) on delete set null,
  delivery_address_id uuid references public.customer_addresses (id) on delete set null,
  billing_address_id uuid references public.customer_addresses (id) on delete set null,
  shipping_method_id uuid references public.shipping_methods (id) on delete set null,
  status public.checkout_status not null default 'open',
  kvkk_consent_at timestamptz,
  distance_sales_consent_at timestamptz,
  total_amount numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- G. Orders / payments --------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,              -- sequential customer-facing (docs/24)
  customer_id uuid references public.customers (id) on delete set null,
  checkout_session_id uuid references public.checkout_sessions (id) on delete set null,
  payable_type public.payable_type not null default 'order',
  reservation_id uuid references public.reservations (id) on delete set null,
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
  fulfillment_status public.fulfillment_status not null default 'not_started',
  total_amount numeric(12,2) not null default 0,
  currency text not null default 'TRY',
  installment_count int not null default 1,
  deposit_amount numeric(12,2),
  balance_amount numeric(12,2),
  invoice_type public.invoice_type not null default 'bireysel',
  invoice_identity jsonb not null default '{}'::jsonb,   -- {ad_soyad,tckn?} | {unvan,vkn,vergi_dairesi}
  einvoice_status public.einvoice_status not null default 'not_required',
  einvoice_ref text,
  delivery_address_snapshot jsonb,
  billing_address_snapshot jsonb,
  legal_snapshot jsonb,                            -- rendered on_bilgilendirme/mesafeli_satis copy
  customer_note text,
  internal_note text,                              -- ADMIN-ONLY
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id);
create index orders_reservation_idx on public.orders (reservation_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  digital_product_id uuid references public.digital_products (id) on delete set null,
  product_snapshot jsonb not null default '{}'::jsonb,
  quantity int not null default 1,
  personalization_json jsonb,
  selected_addons_json jsonb,
  requires_proof boolean not null default false,
  unit_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null default 0
);
create index order_items_order_idx on public.order_items (order_id);

-- Normalized payment record (docs/43 §8). Raw payloads live in payment_events.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  provider public.payment_provider not null,
  provider_payment_id text,
  provider_conversation_id text,
  status public.payment_status not null default 'pending',
  amount numeric(12,2) not null default 0,
  currency text not null default 'TRY',
  installment_count int not null default 1,
  masked_card text,                               -- masked only, never full PAN
  card_family text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Raw provider payloads / risk codes — ADMIN/FINANCE ONLY (docs/23).
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments (id) on delete cascade,
  provider public.payment_provider not null,
  event_type text,
  payload jsonb,
  received_at timestamptz not null default now()
);

create table public.installment_options (
  id uuid primary key default gen_random_uuid(),
  provider public.payment_provider not null,
  min_amount numeric(12,2) not null default 0,
  card_family text,
  count int not null,
  is_active boolean not null default true
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  payment_id uuid references public.payments (id) on delete set null,
  amount numeric(12,2) not null,
  reason public.refund_reason not null default 'customer_request',
  type public.refund_type not null default 'full',
  status public.refund_status not null default 'requested',
  notes_internal text,                            -- ADMIN-ONLY
  created_by uuid references public.staff_users (id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ---- H. Fulfillment / proofing --------------------------------------------
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  shipping_method_id uuid references public.shipping_methods (id) on delete set null,
  carrier_name text,
  tracking_number text,
  status public.shipment_status not null default 'preparing',
  shipped_at timestamptz,
  delivered_at timestamptz,
  internal_note text,                             -- ADMIN-ONLY
  created_at timestamptz not null default now()
);

create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status public.shipment_status,
  message_tr text,
  occurred_at timestamptz not null default now()
);

create table public.product_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  order_item_id uuid references public.order_items (id) on delete set null,
  version int not null default 1,
  media_id uuid references public.media_assets (id),
  status public.proof_status not null default 'draft',
  customer_comment text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- Deferred FK wiring (targets now exist) --------------------------------
alter table public.service_milestones
  add constraint service_milestones_payment_fk
  foreign key (payment_id) references public.payments (id) on delete set null;

alter table public.customer_digital_projects
  add constraint cdp_order_item_fk
  foreign key (order_item_id) references public.order_items (id) on delete set null;

create trigger trg_customer_addresses_updated before update on public.customer_addresses
  for each row execute function public.set_updated_at();
create trigger trg_carts_updated before update on public.carts
  for each row execute function public.set_updated_at();
create trigger trg_cart_items_updated before update on public.cart_items
  for each row execute function public.set_updated_at();
create trigger trg_checkout_sessions_updated before update on public.checkout_sessions
  for each row execute function public.set_updated_at();
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();
create trigger trg_product_proofs_updated before update on public.product_proofs
  for each row execute function public.set_updated_at();
