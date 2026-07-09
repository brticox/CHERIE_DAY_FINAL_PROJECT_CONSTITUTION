-- =============================================================================
-- CHERIE DAY — 0012 · Row Level Security policies (docs/23, docs/42 §10)
-- Fail closed: RLS enabled on every base table. Anon reads only via the public
-- views (0011). Customers see only their own rows. Staff scoped by role helpers.
-- Internal cost/supplier/payment payloads/consent evidence never reach anon.
-- =============================================================================

-- ---- 1. Enable RLS on ALL base tables + baseline admin-manage policy -------
do $$
declare r record;
begin
  for r in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
    -- admin/superadmin manage everything (superadmin auto-passes has_staff_role).
    execute format($f$
      create policy admin_manage_all on public.%I
      for all to authenticated
      using (public.has_staff_role(array['admin']))
      with check (public.has_staff_role(array['admin']))
    $f$, r.tablename);
  end loop;
end $$;

-- ---- 2. Staff role-group manage policies -----------------------------------
-- Each group grants FULL manage on its tables to the listed roles (additive to
-- admin_manage_all). Reads for anon still go only through the public views.
do $$
declare
  t text;
  content_tables text[] := array[
    'departments','categories','event_types','materials','colors','product_tags',
    'collections','collection_sets','collection_set_items','products','product_variants',
    'product_personalization_fields','product_addons','product_price_tiers',
    'product_city_availability','product_event_types','product_materials','product_colors',
    'product_tag_links','digital_products','digital_personalization_fields','digital_assets',
    'experiences','digital_offerings','memory_offerings','faqs','articles','pages',
    'seo_metadata','media_assets','galleries','testimonials','portfolio_projects',
    'search_documents','service_packages','service_addons'
  ];
  order_tables text[] := array[
    'orders','order_items','shipments','tracking_events','product_proofs','shipping_methods'
  ];
  service_tables text[] := array[
    'reservations','reservation_status_history','service_briefs','service_milestones',
    'service_checklists','consultations','quotes','service_availability_blocks',
    'service_cities','service_city_availability'
  ];
  sales_tables text[] := array[
    'leads','lead_notes','lead_status_history','quote_requests','clients','contact_messages'
  ];
  support_tables text[] := array['customer_support_threads','customer_support_messages'];
  operations_tables text[] := array[
    'suppliers','teams','assignments','services_internal','packages_internal'
  ];
  commerce_tables text[] := array[
    'payments','refunds','installment_options','coupons','campaigns','abandoned_carts'
  ];
begin
  foreach t in array content_tables loop
    execute format($f$create policy staff_content_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['content_editor','content_publisher','product_editor','commerce_manager']))
      with check (public.has_staff_role(array['content_editor','content_publisher','product_editor','commerce_manager']))$f$, t);
  end loop;

  foreach t in array order_tables loop
    execute format($f$create policy staff_order_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['order_operations','commerce_manager']))
      with check (public.has_staff_role(array['order_operations','commerce_manager']))$f$, t);
  end loop;

  foreach t in array service_tables loop
    execute format($f$create policy staff_service_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['service_operations','sales_crm']))
      with check (public.has_staff_role(array['service_operations']))$f$, t);
  end loop;

  foreach t in array sales_tables loop
    execute format($f$create policy staff_sales_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['sales_crm','support_agent']))
      with check (public.has_staff_role(array['sales_crm']))$f$, t);
  end loop;

  foreach t in array support_tables loop
    execute format($f$create policy staff_support_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['support_agent','sales_crm']))
      with check (public.has_staff_role(array['support_agent']))$f$, t);
  end loop;

  foreach t in array operations_tables loop
    execute format($f$create policy staff_operations_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['operations']))
      with check (public.has_staff_role(array['operations']))$f$, t);
  end loop;

  foreach t in array commerce_tables loop
    execute format($f$create policy staff_commerce_manage on public.%I for all to authenticated
      using (public.has_staff_role(array['commerce_manager']))
      with check (public.has_staff_role(array['commerce_manager']))$f$, t);
  end loop;
end $$;

-- Finance read-only visibility on money tables (docs/45 §7).
create policy finance_read_payments on public.payments for select to authenticated
  using (public.has_staff_role(array['finance_viewer']));
create policy finance_read_payment_events on public.payment_events for select to authenticated
  using (public.has_staff_role(array['finance_viewer']));
create policy finance_read_refunds on public.refunds for select to authenticated
  using (public.has_staff_role(array['finance_viewer']));

-- Proof designers manage proofs (docs/45 §7).
create policy proof_designer_manage on public.product_proofs for all to authenticated
  using (public.has_staff_role(array['proof_designer']))
  with check (public.has_staff_role(array['proof_designer']));

-- Reviews moderation by content_publisher (docs/45 §4).
create policy content_publisher_moderate_reviews on public.reviews for all to authenticated
  using (public.has_staff_role(array['content_publisher']))
  with check (public.has_staff_role(array['content_publisher']));

-- ---- 3. Customer ownership policies ----------------------------------------
-- customers (predicate is id, not customer_id).
create policy customer_select_self on public.customers for select to authenticated
  using (id = public.current_customer_id());
create policy customer_update_self on public.customers for update to authenticated
  using (id = public.current_customer_id())
  with check (id = public.current_customer_id());
create policy customer_insert_self on public.customers for insert to authenticated
  with check (auth_user_id = auth.uid());

-- Direct customer_id ownership: SELECT own.
do $$
declare t text;
  sel text[] := array[
    'customer_addresses','carts','checkout_sessions','orders','favorites','notifications',
    'notification_preferences','customer_digital_projects','reservations','quotes',
    'consultations','customer_support_threads','reviews','consent_records'
  ];
  ins text[] := array[
    'customer_addresses','favorites','notification_preferences','reservations',
    'consultations','customer_support_threads','reviews'
  ];
  upd text[] := array[
    'customer_addresses','favorites','notification_preferences','notifications',
    'reservations','reviews','customer_digital_projects'
  ];
begin
  foreach t in array sel loop
    execute format($f$create policy cust_select_own on public.%I for select to authenticated
      using (customer_id = public.current_customer_id())$f$, t);
  end loop;
  foreach t in array ins loop
    execute format($f$create policy cust_insert_own on public.%I for insert to authenticated
      with check (customer_id = public.current_customer_id())$f$, t);
  end loop;
  foreach t in array upd loop
    execute format($f$create policy cust_update_own on public.%I for update to authenticated
      using (customer_id = public.current_customer_id())
      with check (customer_id = public.current_customer_id())$f$, t);
  end loop;
end $$;

-- ---- 4. Customer ownership via joins (child tables) ------------------------
create policy cust_select_cart_items on public.cart_items for select to authenticated
  using (exists (select 1 from public.carts c
                 where c.id = cart_items.cart_id and c.customer_id = public.current_customer_id()));
create policy cust_write_cart_items on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c
                 where c.id = cart_items.cart_id and c.customer_id = public.current_customer_id()))
  with check (exists (select 1 from public.carts c
                 where c.id = cart_items.cart_id and c.customer_id = public.current_customer_id()));

create policy cust_select_order_items on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o
                 where o.id = order_items.order_id and o.customer_id = public.current_customer_id()));

create policy cust_select_payments on public.payments for select to authenticated
  using (exists (select 1 from public.orders o
                 where o.id = payments.order_id and o.customer_id = public.current_customer_id()));

create policy cust_select_shipments on public.shipments for select to authenticated
  using (exists (select 1 from public.orders o
                 where o.id = shipments.order_id and o.customer_id = public.current_customer_id()));

create policy cust_select_tracking on public.tracking_events for select to authenticated
  using (exists (select 1 from public.shipments s
                 join public.orders o on o.id = s.order_id
                 where s.id = tracking_events.shipment_id and o.customer_id = public.current_customer_id()));

-- Proofs: customer reads + can act on (approve / request revision) own order's proofs.
create policy cust_select_proofs on public.product_proofs for select to authenticated
  using (exists (select 1 from public.orders o
                 where o.id = product_proofs.order_id and o.customer_id = public.current_customer_id()));
create policy cust_update_proofs on public.product_proofs for update to authenticated
  using (exists (select 1 from public.orders o
                 where o.id = product_proofs.order_id and o.customer_id = public.current_customer_id()))
  with check (exists (select 1 from public.orders o
                 where o.id = product_proofs.order_id and o.customer_id = public.current_customer_id()));

-- Support messages: only non-internal messages of own threads (docs/23).
create policy cust_select_support_messages on public.customer_support_messages for select to authenticated
  using (is_internal_note = false and exists (
    select 1 from public.customer_support_threads th
    where th.id = customer_support_messages.thread_id
      and th.customer_id = public.current_customer_id()));
create policy cust_insert_support_messages on public.customer_support_messages for insert to authenticated
  with check (sender_type = 'customer' and is_internal_note = false and exists (
    select 1 from public.customer_support_threads th
    where th.id = customer_support_messages.thread_id
      and th.customer_id = public.current_customer_id()));

create policy cust_select_res_history on public.reservation_status_history for select to authenticated
  using (exists (select 1 from public.reservations r
                 where r.id = reservation_status_history.reservation_id
                   and r.customer_id = public.current_customer_id()));

create policy cust_rw_service_briefs on public.service_briefs for all to authenticated
  using (exists (select 1 from public.reservations r
                 where r.id = service_briefs.reservation_id
                   and r.customer_id = public.current_customer_id()))
  with check (exists (select 1 from public.reservations r
                 where r.id = service_briefs.reservation_id
                   and r.customer_id = public.current_customer_id()));

create policy cust_select_milestones on public.service_milestones for select to authenticated
  using (exists (select 1 from public.reservations r
                 where r.id = service_milestones.reservation_id
                   and r.customer_id = public.current_customer_id()));

create policy cust_select_download_links on public.digital_download_links for select to authenticated
  using (exists (select 1 from public.customer_digital_projects p
                 where p.id = digital_download_links.customer_digital_project_id
                   and p.customer_id = public.current_customer_id()));

-- ---- 5. Public intake forms (anon INSERT only; no anon SELECT) -------------
do $$
declare t text;
  intake text[] := array['leads','contact_messages','quote_requests','consent_records','cookie_consent_logs'];
begin
  foreach t in array intake loop
    execute format($f$create policy anon_insert_intake on public.%I for insert to anon, authenticated
      with check (true)$f$, t);
  end loop;
end $$;

-- Consultations may be started pre-login (anon), or by a customer (owned above).
create policy anon_insert_consultations on public.consultations for insert to anon, authenticated
  with check (true);

-- ---- 6. Public-safe reads that are NOT view-only ---------------------------
-- site_settings: anon may read the single settings row (footer/contact chrome).
create policy anon_read_site_settings on public.site_settings for select to anon, authenticated
  using (true);

-- ---- 7. staff_users / audit_log self visibility ----------------------------
create policy staff_read_self on public.staff_users for select to authenticated
  using (auth_user_id = auth.uid());
-- (admin_manage_all already gives admins full staff/audit control.)
