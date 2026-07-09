-- =============================================================================
-- CHERIE DAY — 0002 · Identity, system foundation, RLS helper functions
-- Created early because seo_metadata / media_assets / staff_users / customers
-- are referenced by nearly every other module.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- staff_users (docs/08, docs/23). auth_user_id nullable so seed can create one
-- row per role for permission testing before Supabase Auth users are linked.
-- ---------------------------------------------------------------------------
create table public.staff_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  email text,
  role public.staff_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- customers (docs/08). Row-scoped via auth_user_id.
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  name text,
  email text,
  phone text,                         -- Turkey phone format
  kvkk_consent_at timestamptz,
  marketing_consent_at timestamptz,
  status text not null default 'active' check (status in ('active', 'disabled', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media_assets (docs/08). Storage path + bucket; internal media never public.
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'public-media',
  url text,
  storage_path text,
  alt_text text,
  type public.media_type not null default 'image',
  tags text[] not null default '{}',
  linked_entity_type text,
  linked_entity_id uuid,
  is_public boolean not null default true,
  uploaded_by uuid references public.staff_users (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- seo_metadata (docs/08). Referenced by products/experiences/articles/etc.
-- ---------------------------------------------------------------------------
create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id uuid,
  title text,
  description text,
  og_image_id uuid references public.media_assets (id),
  canonical_url text,
  schema_type text,
  noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_settings (docs/08). Singleton config row.
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'CHERIE DAY',
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  social_links jsonb not null default '{}'::jsonb,
  default_seo jsonb not null default '{}'::jsonb,
  service_area_text text default 'Türkiye geneli',
  business_hours jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- audit_log (docs/45 §8). Append-only; admin read only (RLS later).
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid references public.staff_users (id),
  action text not null,
  entity_type text,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- RLS HELPER FUNCTIONS (docs/23). SECURITY DEFINER + STABLE.
-- =============================================================================

-- Current customer's public.customers.id (or null for anon/staff-only).
create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.customers where auth_user_id = auth.uid()
$$;

-- Current staff role text (or null if not active staff).
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.staff_users
  where auth_user_id = auth.uid() and is_active = true
$$;

-- True if current user holds one of the allowed staff roles.
-- superadmin implicitly satisfies every check.
create or replace function public.has_staff_role(allowed text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_staff_role() = any(allowed)
    or public.current_staff_role() = 'superadmin',
    false
  )
$$;

-- True if current user is any active staff member.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_staff_role() is not null
$$;

-- Lock down helper execution to the API roles only.
revoke all on function public.current_customer_id() from public;
revoke all on function public.current_staff_role() from public;
revoke all on function public.has_staff_role(text[]) from public;
revoke all on function public.is_staff() from public;
grant execute on function public.current_customer_id() to anon, authenticated;
grant execute on function public.current_staff_role() to anon, authenticated;
grant execute on function public.has_staff_role(text[]) to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;

create trigger trg_staff_users_updated before update on public.staff_users
  for each row execute function public.set_updated_at();
create trigger trg_customers_updated before update on public.customers
  for each row execute function public.set_updated_at();
create trigger trg_seo_metadata_updated before update on public.seo_metadata
  for each row execute function public.set_updated_at();
