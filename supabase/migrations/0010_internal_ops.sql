-- =============================================================================
-- CHERIE DAY — 0010 · Internal operations (P) — docs/08, docs/23
-- suppliers / teams / assignments + internal building blocks. NEVER public or
-- customer-readable. staff_users + audit_log live in 0002.
-- =============================================================================

-- Internal operational service building blocks (public pages describe
-- `experiences`/`service_packages`, never these). docs/08.
create table public.services_internal (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  internal_cost_notes text,
  experience_id uuid references public.experiences (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

create table public.packages_internal (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  experience_id uuid references public.experiences (id) on delete set null,
  price_band public.price_band,
  included_service_ids uuid[] not null default '{}',
  status public.content_status not null default 'draft'
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_info jsonb not null default '{}'::jsonb,
  capability_tags text[] not null default '{}',
  internal_rating int,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  member_names text[] not null default '{}',
  capability_tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers (id) on delete set null,
  team_id uuid references public.teams (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  portfolio_project_id uuid references public.portfolio_projects (id) on delete set null,
  role_description text,
  status public.assignment_status not null default 'proposed',
  created_at timestamptz not null default now()
);
