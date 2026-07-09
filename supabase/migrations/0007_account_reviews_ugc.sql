-- =============================================================================
-- CHERIE DAY — 0007 · Account extras (I) + Reviews & UGC (J)
-- docs/42 §3-5. Reviews are brand/product/service/experience level, moderated,
-- default pending — NEVER per-supplier (docs/01, docs/09).
-- =============================================================================

-- ---- I. Favorites / notifications ------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  item_type public.favorite_item_type not null,
  item_id uuid not null,
  created_at timestamptz not null default now(),
  unique (customer_id, item_type, item_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  type public.notification_type not null,
  title_tr text not null,
  body_tr text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_customer_idx on public.notifications (customer_id);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  channel public.notification_channel not null,
  category text not null,
  opted_in boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (customer_id, channel, category)
);

-- ---- J. Galleries / testimonials / portfolio -------------------------------
create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  title text,
  media_ids uuid[] not null default '{}',
  linked_entity_type text,                         -- portfolio_project | collection | memory_offering
  linked_entity_id uuid,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- Deferred FK from 0005: link a service package to its past-work gallery.
alter table public.service_packages
  add constraint service_packages_gallery_fk
  foreign key (gallery_id) references public.galleries (id) on delete set null;

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  client_display_name text,                        -- initials / first names only
  event_type text,
  location text,
  collection_id uuid references public.collections (id) on delete set null,
  media_id uuid references public.media_assets (id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  event_type text,
  city text,
  guest_count_band text check (guest_count_band in ('0-25','26-75','76-150','151-300','300+')),
  collection_id uuid references public.collections (id) on delete set null,
  cover_media_id uuid references public.media_assets (id),
  gallery_id uuid references public.galleries (id) on delete set null,
  testimonial_id uuid references public.testimonials (id) on delete set null,
  internal_credit_notes text,                      -- ADMIN-ONLY (supplier credit)
  seo_metadata_id uuid references public.seo_metadata (id),
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- ---- Reviews (moderated UGC) ----------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  subject_type public.review_subject_type not null,   -- never 'supplier'
  subject_id uuid,
  order_id uuid references public.orders (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  rating int check (rating between 1 and 5),
  title text,
  body text,
  photo_media_ids uuid[] not null default '{}',
  photo_consent boolean not null default false,       -- KVKK explicit consent to publish
  is_verified_purchase boolean not null default false,
  status public.review_status not null default 'pending',  -- nothing public until moderated
  moderation_note text,                               -- ADMIN-ONLY
  moderated_by uuid references public.staff_users (id),
  moderated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reviews_customer_idx on public.reviews (customer_id);
create index reviews_subject_idx on public.reviews (subject_type, subject_id);

create trigger trg_notification_prefs_updated before update on public.notification_preferences
  for each row execute function public.set_updated_at();
create trigger trg_reviews_updated before update on public.reviews
  for each row execute function public.set_updated_at();
