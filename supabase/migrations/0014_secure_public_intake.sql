-- =============================================================================
-- CHERIE DAY — 0014 · Secure public intake contract
-- Replaces broad anon table INSERT policies with one field-whitelisted RPC.
-- Stores all first-batch contact/quote/dream/appointment submissions as CRM
-- leads while preventing clients from setting status, assignee, or internal data.
-- =============================================================================

-- The first migration used one permissive policy name on every intake table.
-- Public callers must now use submit_public_intake() instead of direct writes.
drop policy if exists anon_insert_intake on public.leads;
drop policy if exists anon_insert_intake on public.contact_messages;
drop policy if exists anon_insert_intake on public.quote_requests;
drop policy if exists anon_insert_intake on public.consent_records;
drop policy if exists anon_insert_intake on public.cookie_consent_logs;
drop policy if exists anon_insert_consultations on public.consultations;

create or replace function public.submit_public_intake(
  p_intake_type text,
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_event_type text default null,
  p_event_date_or_season text default null,
  p_location text default null,
  p_guest_count_band text default null,
  p_style_notes text default null,
  p_budget_band text default null,
  p_message text default null,
  p_needed_modules text[] default '{}',
  p_source_entity_type text default null,
  p_source_slug text default null,
  p_source_label text default null,
  p_consent boolean default false,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_source public.lead_source_type;
  v_budget public.price_band;
  v_metadata jsonb;
begin
  if p_intake_type not in ('contact', 'quote', 'dream', 'appointment') then
    raise exception 'invalid intake type' using errcode = '22023';
  end if;

  if char_length(trim(coalesce(p_name, ''))) not between 2 and 100 then
    raise exception 'invalid name' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(p_email, '')), '') is null
     and nullif(trim(coalesce(p_phone, '')), '') is null then
    raise exception 'email or phone required' using errcode = '22023';
  end if;

  if p_email is not null and (
    char_length(p_email) > 160 or p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ) then
    raise exception 'invalid email' using errcode = '22023';
  end if;

  if p_phone is not null and char_length(p_phone) > 24 then
    raise exception 'invalid phone' using errcode = '22023';
  end if;

  if p_consent is not true then
    raise exception 'consent required' using errcode = '22023';
  end if;

  if char_length(coalesce(p_message, '')) > 2000
     or char_length(coalesce(p_style_notes, '')) > 1000
     or char_length(coalesce(p_event_type, '')) > 80
     or char_length(coalesce(p_event_date_or_season, '')) > 80
     or char_length(coalesce(p_location, '')) > 120
     or char_length(coalesce(p_guest_count_band, '')) > 40
     or char_length(coalesce(p_source_slug, '')) > 160
     or char_length(coalesce(p_source_label, '')) > 180
     or char_length(array_to_string(coalesce(p_needed_modules, '{}'), ',')) > 400
     or char_length(coalesce(p_metadata ->> 'inquiry_type', '')) > 40
     or char_length(coalesce(p_metadata ->> 'preferred_date', '')) > 40
     or char_length(coalesce(p_metadata ->> 'preferred_time', '')) > 40
     or char_length(coalesce(p_metadata ->> 'mood', '')) > 160
     or char_length(coalesce(p_metadata ->> 'collection', '')) > 100
     or char_length(coalesce(p_metadata ->> 'source_path', '')) > 300
     or cardinality(coalesce(p_needed_modules, '{}')) > 8
     or pg_column_size(coalesce(p_metadata, '{}'::jsonb)) > 8192 then
    raise exception 'payload too large' using errcode = '22023';
  end if;

  if p_source_entity_type is not null
     and p_source_entity_type not in ('product', 'service', 'experience', 'page') then
    raise exception 'invalid source entity type' using errcode = '22023';
  end if;

  if p_metadata ->> 'preferred_channel' is not null
     and p_metadata ->> 'preferred_channel' not in ('online', 'phone', 'whatsapp', 'in_person') then
    raise exception 'invalid preferred channel' using errcode = '22023';
  end if;

  if p_budget_band is not null then
    if p_budget_band not in ('starter', 'premium', 'luxury', 'bespoke') then
      raise exception 'invalid budget band' using errcode = '22023';
    end if;
    v_budget := p_budget_band::public.price_band;
  end if;

  v_source := case
    when p_intake_type = 'contact' and p_source_entity_type = 'product'
      then 'product_inquiry'::public.lead_source_type
    when p_intake_type = 'contact' then 'contact_form'::public.lead_source_type
    when p_intake_type = 'quote' then 'quote_request'::public.lead_source_type
    when p_intake_type = 'dream' then 'hayalini_tasarla'::public.lead_source_type
    when p_intake_type = 'appointment' then 'quote_request'::public.lead_source_type
  end;

  -- Rebuild metadata from an explicit allow-list; arbitrary client keys are
  -- intentionally discarded even when callers bypass the Next.js endpoint.
  v_metadata := jsonb_strip_nulls(
    jsonb_build_object(
      'intake_type', p_intake_type,
      'needed_modules', coalesce(p_needed_modules, '{}'),
      'source_slug', nullif(trim(coalesce(p_source_slug, '')), ''),
      'source_label', nullif(trim(coalesce(p_source_label, '')), ''),
      'source_path', nullif(trim(coalesce(p_metadata ->> 'source_path', '')), ''),
      'inquiry_type', nullif(trim(coalesce(p_metadata ->> 'inquiry_type', '')), ''),
      'preferred_date', nullif(trim(coalesce(p_metadata ->> 'preferred_date', '')), ''),
      'preferred_time', nullif(trim(coalesce(p_metadata ->> 'preferred_time', '')), ''),
      'preferred_channel', nullif(trim(coalesce(p_metadata ->> 'preferred_channel', '')), ''),
      'mood', nullif(trim(coalesce(p_metadata ->> 'mood', '')), ''),
      'collection', nullif(trim(coalesce(p_metadata ->> 'collection', '')), ''),
      'consent_recorded_at', now()
    )
  );

  insert into public.leads (
    source_type,
    source_entity_type,
    source_entity_id,
    name,
    email,
    phone,
    event_type,
    event_date_or_season,
    location,
    guest_count_band,
    style_notes,
    budget_band,
    message,
    metadata,
    status,
    assigned_staff_id
  ) values (
    v_source,
    nullif(trim(coalesce(p_source_entity_type, '')), ''),
    null,
    trim(p_name),
    nullif(lower(trim(coalesce(p_email, ''))), ''),
    nullif(trim(coalesce(p_phone, '')), ''),
    nullif(trim(coalesce(p_event_type, '')), ''),
    nullif(trim(coalesce(p_event_date_or_season, '')), ''),
    nullif(trim(coalesce(p_location, '')), ''),
    nullif(trim(coalesce(p_guest_count_band, '')), ''),
    nullif(trim(coalesce(p_style_notes, '')), ''),
    v_budget,
    nullif(trim(coalesce(p_message, '')), ''),
    v_metadata,
    'new',
    null
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_public_intake(
  text, text, text, text, text, text, text, text, text, text, text,
  text[], text, text, text, boolean, jsonb
) from public;

grant execute on function public.submit_public_intake(
  text, text, text, text, text, text, text, text, text, text, text,
  text[], text, text, text, boolean, jsonb
) to anon, authenticated;
