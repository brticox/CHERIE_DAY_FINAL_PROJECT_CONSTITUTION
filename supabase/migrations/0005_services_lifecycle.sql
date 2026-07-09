-- =============================================================================
-- CHERIE DAY — 0005 · Services (D) + Service lifecycle (E) — docs/41
-- Public "who executes this?" is always CHERIE DAY. Internal suppliers/teams/
-- assignments/checklists stay admin-only (RLS in 0011).
-- =============================================================================

-- ---- D. Services -----------------------------------------------------------

create table public.service_cities (
  id uuid primary key default gen_random_uuid(),
  city_name text not null,
  city_slug text not null unique,
  is_active boolean not null default true,
  travel_fee_model public.travel_fee_model not null default 'quote',
  travel_fee_value numeric(12,2),
  notes_tr text,
  created_at timestamptz not null default now()
);

-- Deferred FK from 0003: physical-product city delivery limits.
alter table public.product_city_availability
  add constraint product_city_availability_city_fk
  foreign key (city_id) references public.service_cities (id) on delete cascade;

create table public.service_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  service_category public.service_category not null,
  summary text,
  description text,
  behavior_type public.service_behavior not null default 'quote_required',
  price_display public.price_display not null default 'quote_only',
  base_from_price numeric(12,2),
  price_band public.price_band,
  deposit_model public.deposit_model not null default 'none',
  deposit_value numeric(12,2),
  requires_event_date boolean not null default false,
  requires_venue boolean not null default false,
  requires_guest_count boolean not null default false,
  min_lead_time_days int not null default 0,
  collection_id uuid references public.collections (id) on delete set null,
  experience_ids uuid[] not null default '{}',
  gallery_id uuid,                                -- FK added in 0007 (galleries)
  hero_media_id uuid references public.media_assets (id),
  internal_cost_notes text,                       -- ADMIN-ONLY
  seo_metadata_id uuid references public.seo_metadata (id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_addons (
  id uuid primary key default gen_random_uuid(),
  service_package_id uuid not null references public.service_packages (id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2),
  price_band public.price_band,
  is_optional boolean not null default true,
  sort_order int not null default 0
);

create table public.service_city_availability (
  id uuid primary key default gen_random_uuid(),
  service_package_id uuid not null references public.service_packages (id) on delete cascade,
  city_id uuid not null references public.service_cities (id) on delete cascade,
  is_available boolean not null default true,
  city_specific_lead_time_days int,
  city_note_tr text,
  unique (service_package_id, city_id)
);

create table public.service_availability_blocks (
  id uuid primary key default gen_random_uuid(),
  service_category public.service_category,
  city_id uuid references public.service_cities (id) on delete cascade,
  date date not null,
  capacity int not null default 0,
  booked_count int not null default 0,
  is_blackout boolean not null default false,
  note text
);
create index sab_date_idx on public.service_availability_blocks (date);

-- ---- E. Service lifecycle --------------------------------------------------
-- lead_id / quote_request_id are plain uuids (CRM tables land in 0008).

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  consultation_number text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  lead_id uuid,
  service_category public.service_category,
  city_id uuid references public.service_cities (id) on delete set null,
  preferred_slots jsonb not null default '[]'::jsonb,
  confirmed_slot jsonb,
  channel public.consultation_channel not null default 'online',
  status public.consultation_status not null default 'requested',
  note text,
  assigned_staff_id uuid references public.staff_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  lead_id uuid,
  quote_request_id uuid,
  items jsonb not null default '[]'::jsonb,
  event_type text,
  event_date date,
  city text,
  venue text,
  guest_count int,
  subtotal numeric(12,2),
  discount numeric(12,2),
  travel_fee numeric(12,2),
  total numeric(12,2),
  deposit_required numeric(12,2),
  valid_until date,
  status public.quote_status not null default 'draft',
  terms_version text,
  notes_customer text,
  notes_internal text,                            -- ADMIN-ONLY
  created_by uuid references public.staff_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_number text not null unique,
  customer_id uuid not null references public.customers (id) on delete cascade,
  service_package_id uuid references public.service_packages (id) on delete set null,
  addon_ids uuid[] not null default '{}',
  quote_id uuid references public.quotes (id) on delete set null,
  event_date date,
  event_time text,
  city_id uuid references public.service_cities (id) on delete set null,
  event_location jsonb not null default '{}'::jsonb,   -- service location, NOT delivery address
  guest_count int,
  collection_id uuid references public.collections (id) on delete set null,
  total_amount numeric(12,2),
  deposit_amount numeric(12,2),
  deposit_paid_at timestamptz,
  balance_due_date date,
  status public.reservation_status not null default 'requested',
  cancellation_reason text,
  assigned_staff_id uuid references public.staff_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reservations_customer_idx on public.reservations (customer_id);

create table public.reservation_status_history (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  from_status public.reservation_status,
  to_status public.reservation_status not null,
  changed_by uuid references public.staff_users (id),
  note text,
  changed_at timestamptz not null default now()
);

create table public.service_briefs (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  brief_json jsonb not null default '{}'::jsonb,
  uploaded_file_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- payment_id FK added in 0006 (payments).
create table public.service_milestones (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  title_tr text not null,
  type public.milestone_type not null,
  amount numeric(12,2),
  due_date date,
  status public.milestone_status not null default 'pending',
  payment_id uuid,
  sort_order int not null default 0
);

-- Internal ops checklist — ADMIN-ONLY (never customer-readable).
create table public.service_checklists (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  item_tr text not null,
  is_done boolean not null default false,
  owner_staff_id uuid references public.staff_users (id),
  due_date date,
  sort_order int not null default 0
);

create trigger trg_service_packages_updated before update on public.service_packages
  for each row execute function public.set_updated_at();
create trigger trg_consultations_updated before update on public.consultations
  for each row execute function public.set_updated_at();
create trigger trg_quotes_updated before update on public.quotes
  for each row execute function public.set_updated_at();
create trigger trg_reservations_updated before update on public.reservations
  for each row execute function public.set_updated_at();
create trigger trg_service_briefs_updated before update on public.service_briefs
  for each row execute function public.set_updated_at();
