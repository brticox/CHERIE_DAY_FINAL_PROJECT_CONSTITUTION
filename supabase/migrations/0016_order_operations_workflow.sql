-- =============================================================================
-- CHERIE DAY — 0016 · Order operations, proof versions, production and quality
-- A guarded paid → design → proof → production → QC → shipment workflow.
-- New exposed tables use explicit grants (Supabase Data API 2026 defaults).
-- =============================================================================

-- Immutable customer/staff-visible history for every meaningful order change.
create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_type text not null check (actor_type in ('system','customer','staff')),
  actor_customer_id uuid references public.customers (id) on delete set null,
  actor_staff_id uuid references public.staff_users (id) on delete set null,
  title_tr text not null,
  detail_tr text,
  metadata jsonb not null default '{}'::jsonb,
  visible_to_customer boolean not null default true,
  created_at timestamptz not null default now()
);
create index order_status_events_order_created_idx
  on public.order_status_events (order_id, created_at desc);

-- Each proof remains a versioned artifact. Files stay in private proof-files.
alter table public.product_proofs
  add column if not exists storage_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists file_size_bytes bigint,
  add column if not exists sent_at timestamptz,
  add column if not exists created_by uuid references public.staff_users (id) on delete set null;

create unique index if not exists product_proofs_order_item_version_uidx
  on public.product_proofs (order_item_id, version)
  where order_item_id is not null;

create table public.proof_comments (
  id uuid primary key default gen_random_uuid(),
  proof_id uuid not null references public.product_proofs (id) on delete cascade,
  actor_type text not null check (actor_type in ('customer','staff')),
  customer_id uuid references public.customers (id) on delete set null,
  staff_user_id uuid references public.staff_users (id) on delete set null,
  comment text not null check (char_length(trim(comment)) between 1 and 2000),
  created_at timestamptz not null default now(),
  check (
    (actor_type = 'customer' and customer_id is not null and staff_user_id is null)
    or (actor_type = 'staff' and staff_user_id is not null and customer_id is null)
  )
);
create index proof_comments_proof_created_idx on public.proof_comments (proof_id, created_at);

-- One production job per custom order item. Starting requires an approved proof.
create table public.production_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  approved_proof_id uuid references public.product_proofs (id) on delete restrict,
  status text not null default 'blocked'
    check (status in ('blocked','ready','in_production','quality_check','passed','rework','packed','completed')),
  priority int not null default 0,
  due_at timestamptz,
  assigned_staff_id uuid references public.staff_users (id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_item_id)
);
create index production_jobs_status_due_idx on public.production_jobs (status, due_at, priority desc);

create table public.quality_checks (
  id uuid primary key default gen_random_uuid(),
  production_job_id uuid not null references public.production_jobs (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','passed','failed')),
  checked_by uuid references public.staff_users (id) on delete set null,
  checked_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table public.quality_check_items (
  id uuid primary key default gen_random_uuid(),
  quality_check_id uuid not null references public.quality_checks (id) on delete cascade,
  key text not null,
  label_tr text not null,
  is_required boolean not null default true,
  passed boolean,
  note text,
  sort_order int not null default 0,
  unique (quality_check_id, key)
);

-- External delivery is processed asynchronously by a worker/provider adapter.
create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  order_id uuid references public.orders (id) on delete cascade,
  channel public.notification_channel not null,
  template_key text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','cancelled')),
  attempts int not null default 0,
  available_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index notification_outbox_pending_idx
  on public.notification_outbox (status, available_at)
  where status in ('pending','failed');

create table public.order_cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 5 and 1000),
  status text not null default 'requested'
    check (status in ('requested','approved','rejected','refund_processing','completed')),
  eligibility_snapshot jsonb not null default '{}'::jsonb,
  reviewed_by uuid references public.staff_users (id) on delete set null,
  reviewed_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now()
);
create unique index one_open_cancellation_per_order
  on public.order_cancellation_requests (order_id)
  where status in ('requested','approved','refund_processing');

create trigger trg_production_jobs_updated before update on public.production_jobs
  for each row execute function public.set_updated_at();

-- Returns whether a customer cancellation can be auto-routed for review.
create or replace function public.order_cancellation_eligibility(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'eligible', o.status in ('paid','in_design','proof_sent','revision_requested'),
    'status', o.status,
    'custom_items', exists (
      select 1 from public.order_items oi where oi.order_id = o.id and oi.requires_proof
    ),
    'production_started', exists (
      select 1 from public.production_jobs pj
      where pj.order_id = o.id and pj.status not in ('blocked','ready')
    )
  )
  from public.orders o
  where o.id = p_order_id and o.customer_id = public.current_customer_id()
$$;

revoke all on function public.order_cancellation_eligibility(uuid) from public, anon;
grant execute on function public.order_cancellation_eligibility(uuid) to authenticated;

-- Customer cancellation is a request, never a direct financial/status mutation.
create or replace function public.request_order_cancellation(p_order_id uuid, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_id uuid := public.current_customer_id();
  v_eligibility jsonb;
  v_request_id uuid;
begin
  if v_customer_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) not between 5 and 1000 then
    raise exception 'invalid reason' using errcode = '22023';
  end if;
  v_eligibility := public.order_cancellation_eligibility(p_order_id);
  if coalesce((v_eligibility ->> 'eligible')::boolean, false) is false then
    raise exception 'order cannot be cancelled at this stage' using errcode = '22023';
  end if;

  insert into public.order_cancellation_requests
    (order_id, customer_id, reason, eligibility_snapshot)
  values (p_order_id, v_customer_id, trim(p_reason), v_eligibility)
  returning id into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function public.request_order_cancellation(uuid, text) from public, anon;
grant execute on function public.request_order_cancellation(uuid, text) to authenticated;

-- Staff-only transition gate. Invalid jumps and premature production fail closed.
create or replace function public.transition_order_status(
  p_order_id uuid,
  p_to_status public.order_status,
  p_detail text default null
)
returns public.order_status
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff_id uuid := public.current_staff_id();
  v_customer_id uuid;
  v_from public.order_status;
  v_allowed boolean := false;
  v_title text;
begin
  if v_staff_id is null or not public.has_staff_role(array['order_operations','commerce_manager','proof_designer']) then
    raise exception 'staff permission required' using errcode = '42501';
  end if;

  select status, customer_id into v_from, v_customer_id
  from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found' using errcode = 'P0002'; end if;

  v_allowed := case v_from
    when 'pending_payment' then p_to_status in ('paid','cancelled')
    when 'paid' then p_to_status in ('in_design','cancelled','refunded')
    when 'in_design' then p_to_status in ('proof_sent','cancelled')
    when 'proof_sent' then p_to_status in ('revision_requested','proof_approved','cancelled')
    when 'revision_requested' then p_to_status = 'in_design'
    when 'proof_approved' then p_to_status = 'in_production'
    when 'in_production' then p_to_status = 'quality_check'
    when 'quality_check' then p_to_status in ('in_production','packed')
    when 'packed' then p_to_status = 'shipped'
    when 'shipped' then p_to_status = 'delivered'
    when 'delivered' then p_to_status = 'completed'
    else false
  end;
  if not v_allowed then
    raise exception 'invalid order transition: % -> %', v_from, p_to_status using errcode = '22023';
  end if;

  if p_to_status = 'in_production' and exists (
    select 1 from public.order_items oi
    where oi.order_id = p_order_id and oi.requires_proof
      and not exists (
        select 1 from public.product_proofs pp
        where pp.order_item_id = oi.id and pp.status = 'approved'
      )
  ) then
    raise exception 'approved proof required before production' using errcode = '23514';
  end if;

  if p_to_status = 'packed' and exists (
    select 1 from public.production_jobs pj
    where pj.order_id = p_order_id and pj.status not in ('passed','packed','completed')
  ) then
    raise exception 'quality check must pass before packing' using errcode = '23514';
  end if;

  v_title := case p_to_status
    when 'paid' then 'Ödemeniz alındı'
    when 'in_design' then 'Tasarım süreci başladı'
    when 'proof_sent' then 'Tasarım onayınıza hazır'
    when 'revision_requested' then 'Revizyon talebiniz alındı'
    when 'proof_approved' then 'Tasarımınız onaylandı'
    when 'in_production' then 'Üretim başladı'
    when 'quality_check' then 'Kalite kontrolünde'
    when 'packed' then 'Özenle paketlendi'
    when 'shipped' then 'Kargoya verildi'
    when 'delivered' then 'Teslim edildi'
    when 'completed' then 'Sipariş tamamlandı'
    when 'cancelled' then 'Sipariş iptal edildi'
    when 'refunded' then 'İade tamamlandı'
    else 'Siparişiniz güncellendi'
  end;

  update public.orders
  set status = p_to_status,
      fulfillment_status = case
        when p_to_status = 'shipped' then 'shipped'::public.fulfillment_status
        when p_to_status in ('delivered','completed') then 'delivered'::public.fulfillment_status
        when p_to_status in ('in_production','quality_check','packed') then 'preparing'::public.fulfillment_status
        else fulfillment_status
      end
  where id = p_order_id;

  insert into public.order_status_events
    (order_id, from_status, to_status, actor_type, actor_staff_id, title_tr, detail_tr)
  values (p_order_id, v_from, p_to_status, 'staff', v_staff_id, v_title, nullif(trim(coalesce(p_detail,'')),''));

  if v_customer_id is not null then
    insert into public.notifications (customer_id, type, title_tr, body_tr, link)
    values (
      v_customer_id,
      case
        when p_to_status = 'proof_sent' then 'proof_ready'::public.notification_type
        when p_to_status in ('shipped','delivered') then 'shipment'::public.notification_type
        else 'order_update'::public.notification_type
      end,
      v_title,
      nullif(trim(coalesce(p_detail,'')),''),
      '/hesap/siparisler/' || (select order_number from public.orders where id = p_order_id)
    );
    insert into public.notification_outbox (customer_id, order_id, channel, template_key, payload)
    select v_customer_id, p_order_id, np.channel, 'order_status_' || p_to_status::text,
      jsonb_build_object('order_id', p_order_id, 'status', p_to_status, 'title', v_title)
    from public.notification_preferences np
    where np.customer_id = v_customer_id and np.category = 'order_updates' and np.opted_in = true
      and np.channel <> 'onsite';
  end if;

  return p_to_status;
end;
$$;

revoke all on function public.transition_order_status(uuid, public.order_status, text) from public, anon;
grant execute on function public.transition_order_status(uuid, public.order_status, text) to authenticated;

-- Atomic proof publishing: creates the next version and moves the order to proof_sent.
create or replace function public.publish_product_proof(
  p_order_item_id uuid,
  p_storage_path text,
  p_file_name text,
  p_mime_type text,
  p_file_size_bytes bigint,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_staff_id uuid := public.current_staff_id();
  v_order_id uuid;
  v_version int;
  v_proof_id uuid;
begin
  if v_staff_id is null or not public.has_staff_role(array['proof_designer','order_operations']) then
    raise exception 'proof permission required' using errcode = '42501';
  end if;
  if p_storage_path is null or p_storage_path !~ '^[0-9a-f-]+/[0-9a-f-]+/' then
    raise exception 'invalid proof path' using errcode = '22023';
  end if;
  if p_file_size_bytes < 1 or p_file_size_bytes > 20971520 then
    raise exception 'invalid proof size' using errcode = '22023';
  end if;

  select oi.order_id into v_order_id
  from public.order_items oi join public.orders o on o.id = oi.order_id
  where oi.id = p_order_item_id and oi.requires_proof
    and o.status in ('paid','in_design','revision_requested')
  for update of o;
  if v_order_id is null then raise exception 'order item not proofable' using errcode = '22023'; end if;

  select coalesce(max(version), 0) + 1 into v_version
  from public.product_proofs where order_item_id = p_order_item_id;

  insert into public.product_proofs
    (order_id, order_item_id, version, storage_path, file_name, mime_type,
     file_size_bytes, status, sent_at, created_by)
  values
    (v_order_id, p_order_item_id, v_version, p_storage_path, p_file_name,
     p_mime_type, p_file_size_bytes, 'sent', now(), v_staff_id)
  returning id into v_proof_id;

  if nullif(trim(coalesce(p_message,'')),'') is not null then
    insert into public.proof_comments (proof_id, actor_type, staff_user_id, comment)
    values (v_proof_id, 'staff', v_staff_id, trim(p_message));
  end if;

  perform public.transition_order_status(v_order_id, 'proof_sent', 'Yeni tasarım versiyonu onayınıza sunuldu.');
  return v_proof_id;
end;
$$;

revoke all on function public.publish_product_proof(uuid, text, text, text, bigint, text) from public, anon;
grant execute on function public.publish_product_proof(uuid, text, text, text, bigint, text) to authenticated;

-- Replace the Phase 4 proof RPC with append-only comments, timeline and job gate updates.
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
  v_customer_id uuid := public.current_customer_id();
  v_status public.proof_status;
  v_order_id uuid;
  v_order_item_id uuid;
  v_from public.order_status;
  v_title text;
begin
  if v_customer_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_action not in ('approve', 'request_revision') then
    raise exception 'invalid proof action' using errcode = '22023';
  end if;
  if p_action = 'request_revision' and char_length(trim(coalesce(p_comment,''))) < 3 then
    raise exception 'revision comment required' using errcode = '22023';
  end if;
  if char_length(coalesce(p_comment, '')) > 2000 then
    raise exception 'comment too long' using errcode = '22023';
  end if;

  select p.order_id, p.order_item_id, o.status
    into v_order_id, v_order_item_id, v_from
  from public.product_proofs p join public.orders o on o.id = p.order_id
  where p.id = p_proof_id and o.customer_id = v_customer_id and p.status = 'sent'
    and not exists (
      select 1 from public.product_proofs newer
      where newer.order_item_id = p.order_item_id and newer.version > p.version
    )
  for update of p, o;
  if v_order_id is null then raise exception 'proof not available' using errcode = '42501'; end if;

  v_status := case when p_action = 'approve' then 'approved'::public.proof_status
    else 'revision_requested'::public.proof_status end;
  v_title := case when p_action = 'approve' then 'Tasarımınız onaylandı'
    else 'Revizyon talebiniz alındı' end;

  update public.product_proofs set status = v_status,
    customer_comment = nullif(trim(coalesce(p_comment, '')), ''),
    approved_at = case when p_action = 'approve' then now() else null end
  where id = p_proof_id;

  if nullif(trim(coalesce(p_comment,'')),'') is not null then
    insert into public.proof_comments (proof_id, actor_type, customer_id, comment)
    values (p_proof_id, 'customer', v_customer_id, trim(p_comment));
  end if;

  update public.orders set status = case when p_action = 'approve'
    then 'proof_approved'::public.order_status else 'revision_requested'::public.order_status end
  where id = v_order_id;

  if p_action = 'approve' then
    insert into public.production_jobs (order_id, order_item_id, approved_proof_id, status)
    values (v_order_id, v_order_item_id, p_proof_id, 'ready')
    on conflict (order_item_id) do update set approved_proof_id = excluded.approved_proof_id, status = 'ready';
  end if;

  insert into public.order_status_events
    (order_id, from_status, to_status, actor_type, actor_customer_id, title_tr, detail_tr)
  values (
    v_order_id, v_from,
    case when p_action = 'approve' then 'proof_approved'::public.order_status else 'revision_requested'::public.order_status end,
    'customer', v_customer_id, v_title, nullif(trim(coalesce(p_comment,'')),'')
  );
  insert into public.notifications (customer_id, type, title_tr, body_tr, link)
  values (v_customer_id, 'order_update', v_title, 'CHERIE DAY ekibi siparişinizi güncelledi.',
    '/hesap/siparisler/' || (select order_number from public.orders where id = v_order_id));

  return v_status;
end;
$$;

revoke all on function public.respond_to_product_proof(uuid, text, text) from public, anon;
grant execute on function public.respond_to_product_proof(uuid, text, text) to authenticated;

-- RLS: fail closed on every new table.
alter table public.order_status_events enable row level security;
alter table public.proof_comments enable row level security;
alter table public.production_jobs enable row level security;
alter table public.quality_checks enable row level security;
alter table public.quality_check_items enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.order_cancellation_requests enable row level security;

create policy customer_read_order_events on public.order_status_events for select to authenticated
  using (visible_to_customer and exists (
    select 1 from public.orders o where o.id = order_status_events.order_id
      and o.customer_id = public.current_customer_id()
  ));
create policy staff_read_order_events on public.order_status_events for select to authenticated
  using (public.has_staff_role(array['admin','order_operations','commerce_manager','proof_designer','support_agent']));
create policy staff_append_order_events on public.order_status_events for insert to authenticated
  with check (actor_staff_id = public.current_staff_id());

create policy customer_read_proof_comments on public.proof_comments for select to authenticated
  using (exists (
    select 1 from public.product_proofs p join public.orders o on o.id = p.order_id
    where p.id = proof_comments.proof_id and o.customer_id = public.current_customer_id()
  ));
create policy staff_manage_proof_comments on public.proof_comments for all to authenticated
  using (public.has_staff_role(array['admin','proof_designer','order_operations']))
  with check (public.has_staff_role(array['admin','proof_designer','order_operations']));

create policy staff_manage_production_jobs on public.production_jobs for all to authenticated
  using (public.has_staff_role(array['admin','order_operations','commerce_manager']))
  with check (public.has_staff_role(array['admin','order_operations','commerce_manager']));
create policy staff_manage_quality_checks on public.quality_checks for all to authenticated
  using (public.has_staff_role(array['admin','order_operations','commerce_manager']))
  with check (public.has_staff_role(array['admin','order_operations','commerce_manager']));
create policy staff_manage_quality_items on public.quality_check_items for all to authenticated
  using (public.has_staff_role(array['admin','order_operations','commerce_manager']))
  with check (public.has_staff_role(array['admin','order_operations','commerce_manager']));

create policy admin_manage_notification_outbox on public.notification_outbox for all to authenticated
  using (public.has_staff_role(array['admin']))
  with check (public.has_staff_role(array['admin']));

create policy customer_read_cancellation_requests on public.order_cancellation_requests for select to authenticated
  using (customer_id = public.current_customer_id());
create policy staff_manage_cancellation_requests on public.order_cancellation_requests for all to authenticated
  using (public.has_staff_role(array['admin','commerce_manager','order_operations','finance_viewer']))
  with check (public.has_staff_role(array['admin','commerce_manager','order_operations']));

-- Data API exposure is explicit; no anon access to operational data.
grant select on public.order_status_events, public.proof_comments,
  public.order_cancellation_requests to authenticated;
grant select, insert, update on public.production_jobs, public.quality_checks,
  public.quality_check_items to authenticated;
grant select, insert on public.notification_outbox to authenticated;
grant usage, select on all sequences in schema public to authenticated;
