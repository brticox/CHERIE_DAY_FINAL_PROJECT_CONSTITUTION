-- =============================================================================
-- CHERIE DAY — 0015 · Auth lifecycle + customer/staff RLS hardening
-- - Creates customer profiles from Supabase Auth registrations.
-- - Removes broad customer mutations on money/status/moderation fields.
-- - Exposes proof decisions through an ownership-checked RPC.
-- - Makes consent/audit/payment-event records append-only through the API.
-- - Separates draft content editing from publishing and commerce control.
-- =============================================================================

-- ---- Auth registration -> customer profile --------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.customers (auth_user_id, name, email, phone, status)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), ''),
    lower(new.email),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    'active'
  )
  on conflict (auth_user_id) do update
    set email = excluded.email,
        name = coalesce(public.customers.name, excluded.name),
        phone = coalesce(public.customers.phone, excluded.phone),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

-- Helper used by append-only audit policies.
create or replace function public.current_staff_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.staff_users
  where auth_user_id = auth.uid() and is_active = true
$$;

revoke all on function public.current_staff_id() from public;
grant execute on function public.current_staff_id() to authenticated;

-- ---- Customer profile: RPC-only mutation ----------------------------------
drop policy if exists customer_update_self on public.customers;

create or replace function public.update_customer_profile(p_name text, p_phone text default null)
returns public.customers
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer public.customers;
begin
  if public.current_customer_id() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_name, ''))) not between 2 and 100 then
    raise exception 'invalid name' using errcode = '22023';
  end if;
  if p_phone is not null and (
    char_length(p_phone) > 24 or p_phone !~ '^[+0-9()[:space:]-]{7,24}$'
  ) then
    raise exception 'invalid phone' using errcode = '22023';
  end if;

  update public.customers
  set name = trim(p_name),
      phone = nullif(trim(coalesce(p_phone, '')), '')
  where id = public.current_customer_id()
  returning * into v_customer;

  return v_customer;
end;
$$;

revoke all on function public.update_customer_profile(text, text) from public;
grant execute on function public.update_customer_profile(text, text) to authenticated;

-- ---- Remove unsafe direct customer mutations ------------------------------
drop policy if exists cust_update_own on public.favorites;
drop policy if exists cust_update_own on public.notifications;
drop policy if exists cust_update_own on public.reservations;
drop policy if exists cust_update_own on public.reviews;
drop policy if exists cust_update_own on public.customer_digital_projects;

drop policy if exists cust_insert_own on public.reservations;
drop policy if exists cust_insert_own on public.consultations;
drop policy if exists cust_insert_own on public.reviews;
drop policy if exists cust_insert_own on public.customer_support_threads;

-- Favorites are immutable rows: insert or delete, never reassigned.
create policy cust_delete_own_favorites on public.favorites
for delete to authenticated
using (customer_id = public.current_customer_id());

-- Customers may only mark their own notifications read/unread. A trigger
-- preserves every server-controlled column even if a crafted UPDATE is sent.
create or replace function public.guard_customer_notification_update()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if not public.is_staff() then
    new.id := old.id;
    new.customer_id := old.customer_id;
    new.type := old.type;
    new.title_tr := old.title_tr;
    new.body_tr := old.body_tr;
    new.link := old.link;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_customer_notification_update on public.notifications;
create trigger trg_guard_customer_notification_update
  before update on public.notifications
  for each row execute function public.guard_customer_notification_update();

revoke all on function public.guard_customer_notification_update() from public, anon, authenticated;

create policy cust_update_own_notification_read_state on public.notifications
for update to authenticated
using (customer_id = public.current_customer_id())
with check (customer_id = public.current_customer_id());

-- ---- Proof response: no direct row UPDATE from customers ------------------
drop policy if exists cust_update_proofs on public.product_proofs;

create or replace function public.respond_to_product_proof(
  p_proof_id uuid,
  p_action text,
  p_comment text default null
)
returns public.proof_status
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status public.proof_status;
  v_order_id uuid;
begin
  if p_action not in ('approve', 'request_revision') then
    raise exception 'invalid proof action' using errcode = '22023';
  end if;
  if char_length(coalesce(p_comment, '')) > 1000 then
    raise exception 'comment too long' using errcode = '22023';
  end if;

  select p.order_id into v_order_id
  from public.product_proofs p
  join public.orders o on o.id = p.order_id
  where p.id = p_proof_id
    and o.customer_id = public.current_customer_id()
    and p.status = 'sent'
  for update of p;

  if v_order_id is null then
    raise exception 'proof not available' using errcode = '42501';
  end if;

  v_status := case
    when p_action = 'approve' then 'approved'::public.proof_status
    else 'revision_requested'::public.proof_status
  end;

  update public.product_proofs
  set status = v_status,
      customer_comment = nullif(trim(coalesce(p_comment, '')), ''),
      approved_at = case when p_action = 'approve' then now() else null end
  where id = p_proof_id;

  update public.orders
  set status = case
    when p_action = 'approve' then 'proof_approved'::public.order_status
    else 'revision_requested'::public.order_status
  end
  where id = v_order_id;

  return v_status;
end;
$$;

revoke all on function public.respond_to_product_proof(uuid, text, text) from public;
grant execute on function public.respond_to_product_proof(uuid, text, text) to authenticated;

-- ---- Append-only evidence and event records -------------------------------
drop policy if exists admin_manage_all on public.audit_log;
drop policy if exists admin_manage_all on public.consent_records;
drop policy if exists admin_manage_all on public.cookie_consent_logs;
drop policy if exists admin_manage_all on public.payment_events;
drop policy if exists admin_manage_all on public.reservation_status_history;
drop policy if exists admin_manage_all on public.lead_status_history;
drop policy if exists admin_manage_all on public.tracking_events;

create policy admin_read_audit_log on public.audit_log for select to authenticated
  using (public.has_staff_role(array['admin']));
create policy staff_append_audit_log on public.audit_log for insert to authenticated
  with check (staff_user_id = public.current_staff_id());

create policy admin_read_consent_records on public.consent_records for select to authenticated
  using (public.has_staff_role(array['admin']));
create policy admin_read_cookie_logs on public.cookie_consent_logs for select to authenticated
  using (public.has_staff_role(array['admin']));
create policy admin_read_payment_events on public.payment_events for select to authenticated
  using (public.has_staff_role(array['admin']));
create policy admin_append_payment_events on public.payment_events for insert to authenticated
  with check (public.has_staff_role(array['admin']));
create policy admin_read_reservation_history on public.reservation_status_history
  for select to authenticated using (public.has_staff_role(array['admin']));
create policy admin_append_reservation_history on public.reservation_status_history
  for insert to authenticated with check (public.has_staff_role(array['admin']));
create policy admin_read_lead_history on public.lead_status_history
  for select to authenticated using (public.has_staff_role(array['admin']));
create policy admin_append_lead_history on public.lead_status_history
  for insert to authenticated with check (public.has_staff_role(array['admin']));
create policy admin_read_tracking_events on public.tracking_events
  for select to authenticated using (public.has_staff_role(array['admin']));
create policy admin_append_tracking_events on public.tracking_events
  for insert to authenticated with check (public.has_staff_role(array['admin']));

-- Status histories are append-only for their operational teams.
drop policy if exists staff_service_manage on public.reservation_status_history;
create policy staff_service_read_reservation_history on public.reservation_status_history
  for select to authenticated using (public.has_staff_role(array['service_operations','sales_crm']));
create policy staff_service_append_reservation_history on public.reservation_status_history
  for insert to authenticated with check (public.has_staff_role(array['service_operations']));

drop policy if exists staff_sales_manage on public.lead_status_history;
create policy staff_sales_read_lead_history on public.lead_status_history
  for select to authenticated using (public.has_staff_role(array['sales_crm','support_agent']));
create policy staff_sales_append_lead_history on public.lead_status_history
  for insert to authenticated with check (public.has_staff_role(array['sales_crm']));

drop policy if exists staff_order_manage on public.tracking_events;
create policy staff_order_read_tracking_events on public.tracking_events
  for select to authenticated using (public.has_staff_role(array['order_operations','commerce_manager']));
create policy staff_order_append_tracking_events on public.tracking_events
  for insert to authenticated with check (public.has_staff_role(array['order_operations','commerce_manager']));

-- ---- Separate content drafting, publishing, and catalog commerce ----------
do $$
declare
  t text;
  all_content text[] := array[
    'departments','categories','event_types','materials','colors','product_tags',
    'collections','collection_sets','collection_set_items','products','product_variants',
    'product_personalization_fields','product_addons','product_price_tiers',
    'product_city_availability','product_event_types','product_materials','product_colors',
    'product_tag_links','digital_products','digital_personalization_fields','digital_assets',
    'experiences','digital_offerings','memory_offerings','faqs','articles','pages',
    'seo_metadata','media_assets','galleries','testimonials','portfolio_projects',
    'search_documents','service_packages','service_addons'
  ];
  editorial_status text[] := array[
    'experiences','digital_offerings','memory_offerings','faqs','articles','pages',
    'galleries','testimonials','portfolio_projects'
  ];
  catalog_status text[] := array[
    'departments','categories','collections','collection_sets','products',
    'product_addons','digital_products'
  ];
  catalog_structure text[] := array[
    'event_types','materials','colors','product_tags','collection_set_items','product_variants',
    'product_personalization_fields','product_price_tiers','product_city_availability',
    'product_event_types','product_materials','product_colors','product_tag_links',
    'digital_personalization_fields','digital_assets'
  ];
begin
  foreach t in array all_content loop
    execute format('drop policy if exists staff_content_manage on public.%I', t);
  end loop;

  foreach t in array editorial_status loop
    execute format($f$create policy editorial_team_read on public.%I for select to authenticated
      using (public.has_staff_role(array['content_editor','content_publisher']))$f$, t);
    execute format($f$create policy content_editor_insert_draft on public.%I for insert to authenticated
      with check (public.has_staff_role(array['content_editor']) and status = 'draft')$f$, t);
    execute format($f$create policy content_editor_update_draft on public.%I for update to authenticated
      using (public.has_staff_role(array['content_editor']) and status = 'draft')
      with check (public.has_staff_role(array['content_editor']) and status = 'draft')$f$, t);
    execute format($f$create policy content_publisher_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['content_publisher']))
      with check (public.has_staff_role(array['content_publisher']))$f$, t);
  end loop;

  foreach t in array catalog_status loop
    execute format($f$create policy catalog_team_read on public.%I for select to authenticated
      using (public.has_staff_role(array['product_editor','commerce_manager']))$f$, t);
    execute format($f$create policy product_editor_insert_draft on public.%I for insert to authenticated
      with check (public.has_staff_role(array['product_editor']) and status = 'draft')$f$, t);
    execute format($f$create policy product_editor_update_draft on public.%I for update to authenticated
      using (public.has_staff_role(array['product_editor']) and status = 'draft')
      with check (public.has_staff_role(array['product_editor']) and status = 'draft')$f$, t);
    execute format($f$create policy commerce_manager_manage_catalog on public.%I for all to authenticated
      using (public.has_staff_role(array['commerce_manager']))
      with check (public.has_staff_role(array['commerce_manager']))$f$, t);
  end loop;

  foreach t in array catalog_structure loop
    execute format($f$create policy product_team_read_structure on public.%I for select to authenticated
      using (public.has_staff_role(array['product_editor','commerce_manager']))$f$, t);
    execute format($f$create policy product_team_manage_structure on public.%I for all to authenticated
      using (public.has_staff_role(array['product_editor','commerce_manager']))
      with check (public.has_staff_role(array['product_editor','commerce_manager']))$f$, t);
  end loop;
end $$;

-- SEO/media have no draft status in the current schema; restrict writes to
-- their dedicated content roles instead of every content/catalog role.
create policy content_team_manage_seo on public.seo_metadata for all to authenticated
  using (public.has_staff_role(array['content_editor','content_publisher']))
  with check (public.has_staff_role(array['content_editor','content_publisher']));
create policy content_team_manage_media on public.media_assets for all to authenticated
  using (public.has_staff_role(array['content_editor','content_publisher']))
  with check (public.has_staff_role(array['content_editor','content_publisher']));

-- Search documents are derived operational data, not editor-owned rows.
create policy publishers_manage_search_documents on public.search_documents for all to authenticated
  using (public.has_staff_role(array['content_publisher','commerce_manager']))
  with check (public.has_staff_role(array['content_publisher','commerce_manager']));

-- Service-package configuration is readable by service operations but only
-- commerce management (or admin through admin_manage_all) may mutate it.
create policy service_team_read_packages on public.service_packages for select to authenticated
  using (public.has_staff_role(array['service_operations','commerce_manager']));
create policy commerce_manager_manage_service_packages on public.service_packages for all to authenticated
  using (public.has_staff_role(array['commerce_manager']))
  with check (public.has_staff_role(array['commerce_manager']));
create policy service_team_read_addons on public.service_addons for select to authenticated
  using (public.has_staff_role(array['service_operations','commerce_manager']));
create policy commerce_manager_manage_service_addons on public.service_addons for all to authenticated
  using (public.has_staff_role(array['commerce_manager']))
  with check (public.has_staff_role(array['commerce_manager']));
