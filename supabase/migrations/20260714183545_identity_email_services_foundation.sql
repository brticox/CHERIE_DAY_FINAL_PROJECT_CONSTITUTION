-- CHERIE DAY identity and email-services foundation.
-- Supabase Auth remains authoritative; no provider token or raw webhook payload is stored.

create table public.customer_identity_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (provider in ('email', 'google', 'apple')),
  event_type text not null check (
    event_type in ('signed_in', 'linked', 'link_failed', 'revoked', 'blocked')
  ),
  provider_identity_hash text,
  created_at timestamptz not null default now()
);

create index customer_identity_events_customer_created_idx
  on public.customer_identity_events (customer_id, created_at desc);

alter table public.customer_identity_events enable row level security;
revoke all on public.customer_identity_events from anon, authenticated;
grant select on public.customer_identity_events to authenticated;

create policy customer_identity_events_select_self
on public.customer_identity_events for select to authenticated
using (customer_id = public.current_customer_id());

create or replace function public.ensure_current_customer_profile()
returns public.customers
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  v_user auth.users;
  v_customer public.customers;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select * into v_user from auth.users where id = auth.uid();
  if v_user.id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.customers (auth_user_id, name, email, phone, status)
  values (
    v_user.id,
    nullif(trim(coalesce(v_user.raw_user_meta_data ->> 'name', v_user.raw_user_meta_data ->> 'full_name', '')), ''),
    lower(v_user.email),
    nullif(trim(coalesce(v_user.raw_user_meta_data ->> 'phone', '')), ''),
    'active'
  )
  on conflict (auth_user_id) do update
    set email = excluded.email,
        name = coalesce(public.customers.name, excluded.name),
        phone = coalesce(public.customers.phone, excluded.phone),
        updated_at = now()
  returning * into v_customer;

  if v_customer.status <> 'active' then
    raise exception 'account disabled' using errcode = '42501';
  end if;

  return v_customer;
end;
$$;

revoke all on function public.ensure_current_customer_profile() from public, anon;
grant execute on function public.ensure_current_customer_profile() to authenticated;

create or replace function public.record_current_identity_event(
  p_provider text,
  p_event_type text default 'signed_in'
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  v_customer_id uuid;
  v_identity_id text;
  v_event_id uuid;
begin
  if p_provider not in ('email', 'google', 'apple')
    or p_event_type <> 'signed_in' then
    raise exception 'invalid identity event' using errcode = '22023';
  end if;

  select id into v_customer_id
  from public.customers
  where auth_user_id = auth.uid() and status = 'active';

  if v_customer_id is null then
    raise exception 'active customer required' using errcode = '42501';
  end if;

  select id::text into v_identity_id
  from auth.identities
  where user_id = auth.uid() and provider = p_provider
  order by created_at desc
  limit 1;
  if v_identity_id is null then
    raise exception 'provider identity missing' using errcode = '42501';
  end if;

  select id into v_event_id
  from public.customer_identity_events
  where customer_id = v_customer_id
    and provider = p_provider
    and event_type = p_event_type
    and created_at >= now() - interval '30 seconds'
  order by created_at desc
  limit 1;
  if v_event_id is not null then return v_event_id; end if;

  insert into public.customer_identity_events (
    customer_id, auth_user_id, provider, event_type, provider_identity_hash
  ) values (
    v_customer_id,
    auth.uid(),
    p_provider,
    p_event_type,
    encode(extensions.digest(v_identity_id, 'sha256'), 'hex')
  ) returning id into v_event_id;

  return v_event_id;
end;
$$;

revoke all on function public.record_current_identity_event(text, text) from public, anon;
grant execute on function public.record_current_identity_event(text, text) to authenticated;

create or replace function public.merge_guest_cart_for_current_user(p_token_hash text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_id uuid;
  v_guest public.carts;
  v_customer_cart public.carts;
begin
  v_customer_id := public.current_customer_id();
  if v_customer_id is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid cart merge' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_customer_id::text, 0));

  select * into v_guest from public.carts
  where anonymous_token_hash = p_token_hash and status = 'active'
  for update;
  if v_guest.id is null then return null; end if;

  select * into v_customer_cart from public.carts
  where customer_id = v_customer_id and status = 'active'
  for update;

  if v_customer_cart.id is null then
    update public.carts
    set customer_id = v_customer_id, anonymous_token_hash = null, updated_at = now()
    where id = v_guest.id;
    update public.customer_uploads
    set customer_id = v_customer_id, anonymous_token_hash = null
    where cart_id = v_guest.id;
    return v_guest.id;
  end if;

  update public.cart_items set cart_id = v_customer_cart.id where cart_id = v_guest.id;
  update public.customer_uploads
  set cart_id = v_customer_cart.id, customer_id = v_customer_id, anonymous_token_hash = null
  where cart_id = v_guest.id;
  update public.carts set status = 'abandoned', updated_at = now() where id = v_guest.id;
  return v_customer_cart.id;
end;
$$;

revoke all on function public.merge_guest_cart_for_current_user(text) from public, anon;
grant execute on function public.merge_guest_cart_for_current_user(text) to authenticated;

create table public.email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  provider_message_id text not null,
  event_type text not null check (
    event_type in ('email.sent', 'email.delivered', 'email.delivery_delayed', 'email.bounced', 'email.complained', 'email.failed', 'email.suppressed')
  ),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index email_delivery_events_message_created_idx
  on public.email_delivery_events (provider_message_id, created_at desc);

alter table public.email_delivery_events enable row level security;
revoke all on public.email_delivery_events from anon, authenticated;

alter table public.notification_outbox drop constraint if exists notification_outbox_status_check;
alter table public.notification_outbox add constraint notification_outbox_status_check check (
  status in ('queued','processing','sent','delivered','delayed','bounced','complained','failed','retry_scheduled','permanently_failed','cancelled')
);

create or replace function public.ingest_resend_delivery_event(
  p_provider_event_id text,
  p_provider_message_id text,
  p_event_type text,
  p_occurred_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_inserted_count integer;
  v_status text;
begin
  if p_event_type not in ('email.sent', 'email.delivered', 'email.delivery_delayed', 'email.bounced', 'email.complained', 'email.failed', 'email.suppressed')
    or length(p_provider_event_id) not between 1 and 200
    or length(p_provider_message_id) not between 1 and 200 then
    raise exception 'invalid delivery event' using errcode = '22023';
  end if;

  insert into public.email_delivery_events (
    provider_event_id, provider_message_id, event_type, occurred_at
  ) values (
    p_provider_event_id, p_provider_message_id, p_event_type, p_occurred_at
  ) on conflict (provider_event_id) do nothing;
  get diagnostics v_inserted_count = row_count;

  if v_inserted_count = 0 then return false; end if;

  v_status := case p_event_type
    when 'email.delivered' then 'delivered'
    when 'email.delivery_delayed' then 'delayed'
    when 'email.bounced' then 'bounced'
    when 'email.complained' then 'complained'
    when 'email.failed' then 'failed'
    when 'email.suppressed' then 'failed'
    else 'sent'
  end;

  update public.notification_outbox
  set status = v_status,
      failed_at = case when v_status in ('bounced','complained','failed') then p_occurred_at else failed_at end,
      updated_at = now()
  where provider = 'resend' and provider_message_id = p_provider_message_id;

  return true;
end;
$$;

revoke all on function public.ingest_resend_delivery_event(text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.ingest_resend_delivery_event(text, text, text, timestamptz) to service_role;
