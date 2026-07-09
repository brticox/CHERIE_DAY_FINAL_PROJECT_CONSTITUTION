-- =============================================================================
-- CHERIE DAY — 0009 · Content/CMS (M) + Search (N) + Marketing (O)
-- docs/08, docs/42 §8-9. seo_metadata / media_assets / site_settings are in 0002.
-- =============================================================================

-- ---- M. Content / CMS ------------------------------------------------------
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  summary text,
  process_steps jsonb not null default '[]'::jsonb,
  included_modules jsonb not null default '{}'::jsonb,
  hero_media_id uuid references public.media_assets (id),
  seo_metadata_id uuid references public.seo_metadata (id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deferred FK from 0008.
alter table public.quote_requests
  add constraint quote_requests_experience_fk
  foreign key (experience_id) references public.experiences (id) on delete set null;

-- Marketing-layer digital offerings (distinct from sellable digital_products).
create table public.digital_offerings (
  id uuid primary key default gen_random_uuid(),
  type public.digital_offering_type not null,
  title text not null,
  description text,
  collection_id uuid references public.collections (id) on delete set null,
  preview_media_id uuid references public.media_assets (id),
  status public.content_status not null default 'draft'
);

create table public.memory_offerings (
  id uuid primary key default gen_random_uuid(),
  type public.memory_offering_type not null,
  title text not null,
  description text,
  delivery_timeline_days int,
  collection_id uuid references public.collections (id) on delete set null,
  status public.content_status not null default 'draft'
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category public.faq_category not null default 'process',
  linked_entity_type text,
  linked_entity_id uuid,
  sort_order int not null default 0,
  status public.content_status not null default 'draft'
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  category text,
  author_display text not null default 'CHERIE DAY Ekibi',
  related_experience_ids uuid[] not null default '{}',
  related_product_ids uuid[] not null default '{}',
  related_collection_ids uuid[] not null default '{}',
  cover_media_id uuid references public.media_assets (id),
  seo_metadata_id uuid references public.seo_metadata (id),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body jsonb not null default '{}'::jsonb,
  seo_metadata_id uuid references public.seo_metadata (id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- N. Search index (docs/42 §8) -----------------------------------------
create table public.search_documents (
  id uuid primary key default gen_random_uuid(),
  entity_type public.search_entity_type not null,
  entity_id uuid not null,
  title_tr text not null,
  body_tokens tsvector,
  tags text[] not null default '{}',
  department text,
  event_types text[] not null default '{}',
  status public.content_status not null default 'draft',
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);
create index search_documents_tokens_idx on public.search_documents using gin (body_tokens);
create index search_documents_title_trgm_idx on public.search_documents using gin (title_tr gin_trgm_ops);

-- ---- O. Marketing ----------------------------------------------------------
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type public.price_type not null default 'percentage',
  discount_value numeric(12,2) not null default 0,
  scope text,                                        -- collection|category|product|service|global
  scope_id uuid,
  min_order_amount numeric(12,2),
  usage_limit int,
  used_count int not null default 0,
  per_customer_limit int,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  channel public.notification_channel,
  scope text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Admin-visibility only in MVP (docs/42 §9).
create table public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  email text,
  last_step text check (last_step in ('cart', 'address', 'payment')),
  value numeric(12,2),
  recovered boolean not null default false,
  created_at timestamptz not null default now()
);

create trigger trg_experiences_updated before update on public.experiences
  for each row execute function public.set_updated_at();
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();
create trigger trg_pages_updated before update on public.pages
  for each row execute function public.set_updated_at();
