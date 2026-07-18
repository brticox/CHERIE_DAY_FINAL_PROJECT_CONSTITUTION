-- Vendor-neutral, first-party analytics sink. It stores only allow-listed,
-- pseudonymous event context after explicit analytics consent. No browser role
-- can read or write the table directly.
create table public.analytics_events (
  id uuid primary key,
  session_ref uuid not null,
  event_name text not null check (event_name in (
    'page_view','view_item','add_to_cart','remove_from_cart','view_cart',
    'begin_checkout','select_shipping','login','sign_up','purchase',
    'service_lead_submitted','proof_viewed','proof_approved'
  )),
  route text not null check (
    route like '/%' and route not like '%?%' and length(route) between 1 and 300
  ),
  entity_type text check (entity_type in ('product','collection','service','order','proof')),
  entity_id text check (entity_id is null or length(entity_id) between 1 and 160),
  properties jsonb not null default '{}'::jsonb,
  consent_version text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  constraint analytics_properties_object check (jsonb_typeof(properties) = 'object')
);

create index analytics_events_name_received_idx
  on public.analytics_events(event_name, received_at desc);
create index analytics_events_session_received_idx
  on public.analytics_events(session_ref, received_at desc);

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from public, anon, authenticated;
grant all on public.analytics_events to service_role;
