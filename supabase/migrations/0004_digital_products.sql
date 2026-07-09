-- =============================================================================
-- CHERIE DAY — 0004 · Digital products (C) — docs/42 §2
-- Sellable/deliverable digital layer (distinct from the marketing-only
-- digital_offerings table in the CMS module). Delivery is token/owner-scoped.
-- =============================================================================

create table public.digital_products (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  slug text not null unique,
  collection_id uuid references public.collections (id) on delete set null,
  digital_type public.digital_type not null,
  behavior public.digital_behavior not null default 'digital_checkout',
  base_price numeric(12,2),
  preview_media_ids uuid[] not null default '{}',
  delivery_mode public.digital_delivery_mode not null default 'link',
  seo_metadata_id uuid references public.seo_metadata (id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Personalization for digital products reuses the shape of product fields.
create table public.digital_personalization_fields (
  id uuid primary key default gen_random_uuid(),
  digital_product_id uuid not null references public.digital_products (id) on delete cascade,
  label text not null,
  field_type public.personalization_field_type not null,
  required boolean not null default false,
  options jsonb,
  helper_text text,
  sort_order int not null default 0
);

-- Source assets live in private buckets (internal-media/proof-files); never public.
create table public.digital_assets (
  id uuid primary key default gen_random_uuid(),
  digital_product_id uuid not null references public.digital_products (id) on delete cascade,
  storage_path text not null,
  bucket text not null default 'internal-media',
  asset_type text,
  is_source boolean not null default true,
  created_at timestamptz not null default now()
);

-- Per-purchase instance. order_item_id FK added in 0006 once order_items exists.
create table public.customer_digital_projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  order_item_id uuid,
  digital_product_id uuid references public.digital_products (id) on delete set null,
  project_data jsonb not null default '{}'::jsonb,   -- names, date, venue, text
  status public.digital_project_status not null default 'draft',
  delivered_url text,
  access_token_hash text,                            -- ownership gate (docs/23)
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cdp_customer_idx on public.customer_digital_projects (customer_id);

create table public.digital_download_links (
  id uuid primary key default gen_random_uuid(),
  customer_digital_project_id uuid not null
    references public.customer_digital_projects (id) on delete cascade,
  url_signed_ref text,
  download_count int not null default 0,
  max_downloads int,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create trigger trg_digital_products_updated before update on public.digital_products
  for each row execute function public.set_updated_at();
create trigger trg_cdp_updated before update on public.customer_digital_projects
  for each row execute function public.set_updated_at();
