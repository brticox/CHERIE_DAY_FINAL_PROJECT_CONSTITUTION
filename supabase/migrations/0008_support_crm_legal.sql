-- =============================================================================
-- CHERIE DAY — 0008 · Support & CRM (K) + Legal & consent (L)
-- docs/08, docs/24, docs/42 §7. Leads/CRM fully private (insert-only for anon).
-- =============================================================================

-- ---- K. Support ------------------------------------------------------------
create table public.customer_support_threads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  source public.support_source not null default 'account',
  subject text,
  status public.support_status not null default 'open',
  assigned_staff_id uuid references public.staff_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_threads_customer_idx on public.customer_support_threads (customer_id);

create table public.customer_support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.customer_support_threads (id) on delete cascade,
  sender_type public.support_sender_type not null,
  sender_id uuid,
  message text not null,
  attachment_ids uuid[] not null default '{}',
  is_internal_note boolean not null default false,   -- ADMIN-ONLY when true
  created_at timestamptz not null default now()
);
create index support_messages_thread_idx on public.customer_support_messages (thread_id);

-- ---- K. CRM (private — no anon select) -------------------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  source_type public.lead_source_type not null default 'contact_form',
  source_entity_type text,
  source_entity_id uuid,
  name text,
  email text,
  phone text,
  event_type text,
  event_date_or_season text,
  location text,
  guest_count_band text,
  style_notes text,
  budget_band public.price_band,
  message text,
  metadata jsonb not null default '{}'::jsonb,       -- folds quote_request extras (docs/08)
  status public.lead_status not null default 'new',
  assigned_staff_id uuid references public.staff_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  author_id uuid references public.staff_users (id),
  note text not null,
  created_at timestamptz not null default now()
);

create table public.lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  from_status public.lead_status,
  to_status public.lead_status not null,
  changed_by uuid references public.staff_users (id),
  changed_at timestamptz not null default now()
);

-- Structured quote request (kept as its own table; leads.metadata is the
-- lighter alternative from docs/08). Referenced by quotes.quote_request_id.
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  name text,
  email text,
  phone text,
  event_type text,
  event_date_or_season text,
  city text,
  venue_type text,
  guest_count int,
  needed_modules text[] not null default '{}',
  service_package_ids uuid[] not null default '{}',
  experience_id uuid,                                -- FK to experiences (created in 0009)
  collection_id uuid references public.collections (id) on delete set null,
  budget_band public.price_band,
  message text,
  uploaded_file_ids uuid[] not null default '{}',
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  inquiry_type public.contact_inquiry_type not null default 'general',
  message text,
  consent boolean not null default false,
  status public.contact_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete set null,
  name text,
  email text,
  phone text,
  auth_user_id uuid references auth.users (id) on delete set null,
  status public.client_status not null default 'active',
  created_at timestamptz not null default now()
);

-- ---- L. Legal & consent (docs/24, docs/42 §7) ------------------------------
create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  doc_key public.legal_doc_key not null unique,
  title_tr text not null,
  slug text not null unique,
  status public.content_status not null default 'draft'
);

create table public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  legal_document_id uuid not null references public.legal_documents (id) on delete cascade,
  version text not null,
  body jsonb not null default '{}'::jsonb,
  effective_from date,
  is_current boolean not null default false,
  published_by uuid references public.staff_users (id),
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index legal_versions_current_idx on public.legal_document_versions (legal_document_id, is_current);

-- Consent evidence — PRIVATE, append-only. Never publicly selectable.
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  session_ref text,
  consent_type public.consent_type not null,
  legal_document_version_id uuid references public.legal_document_versions (id) on delete set null,
  checkbox_label_snapshot text,
  order_id uuid references public.orders (id) on delete set null,
  reservation_id uuid references public.reservations (id) on delete set null,
  ip inet,
  user_agent text,
  source_route text,
  created_at timestamptz not null default now()
);

create table public.cookie_consent_logs (
  id uuid primary key default gen_random_uuid(),
  session_ref text,
  customer_id uuid references public.customers (id) on delete set null,
  categories_json jsonb not null default '{}'::jsonb,  -- {necessary,analytics,marketing}
  action public.cookie_action not null,
  consent_version text,
  ip inet,
  created_at timestamptz not null default now()
);

create trigger trg_support_threads_updated before update on public.customer_support_threads
  for each row execute function public.set_updated_at();
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();
