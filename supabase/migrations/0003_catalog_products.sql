-- =============================================================================
-- CHERIE DAY — 0003 · Catalog taxonomy (A) + Products (B)
-- docs/08, docs/26, docs/37, docs/42 §1
-- =============================================================================

-- ---- A. Catalog taxonomy ---------------------------------------------------

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  slug text not null unique,
  description text,
  icon_media_id uuid references public.media_assets (id),
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments (id) on delete set null,
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories (id) on delete set null,
  description text,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_types (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  slug text not null unique,
  sort_order int not null default 0,
  status public.content_status not null default 'published'
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.colors (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  slug text not null unique,
  hex text,
  sort_order int not null default 0
);

create table public.product_tags (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  story text,
  palette jsonb not null default '[]'::jsonb,
  materials text[] not null default '{}',
  hero_media_id uuid references public.media_assets (id),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  seo_metadata_id uuid references public.seo_metadata (id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_sets (
  id uuid primary key default gen_random_uuid(),
  name_tr text not null,
  slug text not null unique,
  collection_id uuid references public.collections (id) on delete set null,
  story text,
  bundle_price numeric(12,2),
  bundle_discount_pct numeric(5,2),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- B. Products -----------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories (id) on delete set null,
  collection_id uuid references public.collections (id) on delete set null,
  collection_set_id uuid references public.collection_sets (id) on delete set null,
  description text,
  motif text,
  material_story text,
  materials text,
  packaging_notes text,
  occasion_type text,
  object_type text,
  brand_motif_tags text[] not null default '{}',
  is_personalizable boolean not null default false,
  proof_required boolean not null default false,
  gift_wrapping_available boolean not null default false,
  personalization_options jsonb not null default '{}'::jsonb,
  behavior_type public.product_behavior not null default 'inquiry_only',
  base_price numeric(12,2),                       -- public only when cart-enabled
  currency text not null default 'TRY',           -- Turkey-only (docs/24)
  sku text,                                        -- public-safe SKU only
  stock_mode public.stock_mode not null default 'made_to_order',
  production_time_days int,
  price_band public.price_band,
  internal_cost numeric(12,2),                     -- ADMIN-ONLY; never in public view
  return_note text,
  delivery_note text,
  media_ids uuid[] not null default '{}',
  seo_metadata_id uuid references public.seo_metadata (id),
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_collection_idx on public.products (collection_id);
create index products_status_idx on public.products (status);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text,
  title text not null,
  option_values jsonb not null default '{}'::jsonb,
  price numeric(12,2),
  stock_quantity int,
  status public.variant_status not null default 'active',
  sort_order int not null default 0
);
create index product_variants_product_idx on public.product_variants (product_id);

create table public.product_personalization_fields (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,                            -- Turkish label
  field_type public.personalization_field_type not null,
  required boolean not null default false,
  options jsonb,
  helper_text text,
  sort_order int not null default 0
);

create table public.product_addons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,  -- null = global addon
  name_tr text not null,
  addon_type public.addon_type not null default 'other',
  price numeric(12,2) not null default 0,
  price_type public.price_type not null default 'fixed',
  is_optional boolean not null default true,
  sort_order int not null default 0,
  status public.content_status not null default 'published'
);

create table public.product_price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  min_qty int not null,
  unit_price numeric(12,2) not null
);

-- city_id FK added in the services migration (0005) once service_cities exists.
create table public.product_city_availability (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  city_id uuid not null,
  is_available boolean not null default true,
  extra_lead_time_days int
);

-- ---- Join tables -----------------------------------------------------------

create table public.product_event_types (
  product_id uuid not null references public.products (id) on delete cascade,
  event_type_id uuid not null references public.event_types (id) on delete cascade,
  primary key (product_id, event_type_id)
);

create table public.product_materials (
  product_id uuid not null references public.products (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  primary key (product_id, material_id)
);

create table public.product_colors (
  product_id uuid not null references public.products (id) on delete cascade,
  color_id uuid not null references public.colors (id) on delete cascade,
  primary key (product_id, color_id)
);

create table public.product_tag_links (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.product_tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

create table public.collection_set_items (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.collection_sets (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  default_quantity int not null default 1,
  is_required boolean not null default false,
  sort_order int not null default 0
);

create trigger trg_departments_updated before update on public.departments
  for each row execute function public.set_updated_at();
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();
create trigger trg_collections_updated before update on public.collections
  for each row execute function public.set_updated_at();
create trigger trg_collection_sets_updated before update on public.collection_sets
  for each row execute function public.set_updated_at();
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();
