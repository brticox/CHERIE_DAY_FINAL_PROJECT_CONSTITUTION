-- Phase 3: financial integrity, replay-safe callbacks, reconciliation and refunds.
-- All provider writes are service-role only; all human finance actions pass
-- through role-checking RPCs and append an immutable audit record.

alter table public.payments
  add column if not exists amount_minor bigint,
  add column if not exists captured_total_minor bigint,
  add column if not exists attempt_number int not null default 1,
  add column if not exists initialized_at timestamptz,
  add column if not exists provider_redirect_url text,
  add column if not exists pending_expires_at timestamptz,
  add column if not exists correlation_id uuid;

update public.payments set amount_minor = round(amount * 100)::bigint
where amount_minor is null;
alter table public.payments alter column amount_minor set not null;

alter table public.payments drop constraint if exists payments_amount_positive;
alter table public.payments add constraint payments_amount_positive
  check (amount > 0 and amount_minor > 0 and amount_minor <= 10000000000);
alter table public.payments drop constraint if exists payments_amount_minor_matches;
alter table public.payments add constraint payments_amount_minor_matches
  check (amount_minor = round(amount * 100)::bigint);
alter table public.payments drop constraint if exists payments_try_only;
alter table public.payments add constraint payments_try_only check (currency = 'TRY');
alter table public.payments drop constraint if exists payments_attempt_positive;
alter table public.payments add constraint payments_attempt_positive
  check (attempt_number between 1 and 100);

create unique index if not exists payments_provider_order_uidx
  on public.payments (provider, provider_conversation_id)
  where provider_conversation_id is not null;
create index if not exists payments_pending_expiry_idx
  on public.payments (pending_expires_at, created_at)
  where status = 'pending';

alter table public.payment_events
  add column if not exists correlation_id uuid,
  add column if not exists outcome text not null default 'received'
    check (outcome in (
      'received','applied','duplicate','invalid_signature','amount_mismatch',
      'currency_mismatch','ignored_conflict','orphaned','failed'
    )),
  add column if not exists payload_digest text;
create index if not exists payment_events_payment_received_idx
  on public.payment_events (payment_id, received_at desc);

alter table public.refunds
  add column if not exists amount_minor bigint,
  add column if not exists idempotency_key text,
  add column if not exists requested_by uuid references public.staff_users(id),
  add column if not exists approved_by uuid references public.staff_users(id),
  add column if not exists approved_at timestamptz,
  add column if not exists submitted_at timestamptz,
  add column if not exists provider_status text not null default 'not_submitted'
    check (provider_status in ('not_submitted','submitted','succeeded','failed','cancelled')),
  add column if not exists provider_reference text,
  add column if not exists provider_error_code text,
  add column if not exists provider_error_message text,
  add column if not exists retryable boolean not null default false,
  add column if not exists correlation_id uuid;

update public.refunds set amount_minor = round(amount * 100)::bigint
where amount_minor is null;
alter table public.refunds alter column amount_minor set not null;
alter table public.refunds drop constraint if exists refunds_amount_positive;
alter table public.refunds add constraint refunds_amount_positive
  check (amount > 0 and amount_minor > 0 and amount_minor <= 10000000000);
alter table public.refunds drop constraint if exists refunds_amount_minor_matches;
alter table public.refunds add constraint refunds_amount_minor_matches
  check (amount_minor = round(amount * 100)::bigint);
create unique index if not exists refunds_idempotency_uidx
  on public.refunds (idempotency_key) where idempotency_key is not null;
create unique index if not exists refunds_provider_reference_uidx
  on public.refunds (provider_reference) where provider_reference is not null;
create index if not exists refunds_payment_status_idx
  on public.refunds (payment_id, status, provider_status);

create table public.payment_reconciliation_discrepancies (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  discrepancy_type text not null check (discrepancy_type in (
    'stuck_pending','provider_paid_local_unpaid','local_paid_without_evidence',
    'amount_mismatch','currency_mismatch','orphaned_event','conflicting_callback',
    'refund_failure','manual_review'
  )),
  severity text not null check (severity in ('low','medium','high','critical')),
  status text not null default 'open'
    check (status in ('open','investigating','resolved','dismissed')),
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  payment_event_id uuid references public.payment_events(id) on delete set null,
  refund_id uuid references public.refunds(id) on delete set null,
  expected_amount_minor bigint,
  provider_amount_minor bigint,
  provider_reference text,
  evidence jsonb not null default '{}'::jsonb,
  recommended_action text not null,
  assigned_reviewer uuid references public.staff_users(id) on delete set null,
  resolution_notes text,
  last_checked_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payment_reconciliation_open_idx
  on public.payment_reconciliation_discrepancies (severity, created_at)
  where status in ('open','investigating');
create index payment_reconciliation_payment_idx
  on public.payment_reconciliation_discrepancies (payment_id, created_at desc);

create table public.financial_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  severity text not null default 'info'
    check (severity in ('info','warning','error','critical')),
  actor_type text not null check (actor_type in ('system','provider','staff')),
  actor_staff_id uuid references public.staff_users(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  payment_event_id uuid references public.payment_events(id) on delete set null,
  refund_id uuid references public.refunds(id) on delete set null,
  correlation_id uuid not null,
  provider_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index financial_audit_payment_created_idx
  on public.financial_audit_log (payment_id, created_at desc);
create index financial_audit_order_created_idx
  on public.financial_audit_log (order_id, created_at desc);
create index financial_audit_correlation_idx
  on public.financial_audit_log (correlation_id);

create table public.payment_rate_limits (
  route_key text not null,
  identity_hash text not null,
  window_started_at timestamptz not null,
  request_count int not null check (request_count > 0),
  primary key (route_key, identity_hash, window_started_at)
);
create index payment_rate_limits_expiry_idx
  on public.payment_rate_limits (window_started_at);

alter table public.payment_reconciliation_discrepancies enable row level security;
alter table public.financial_audit_log enable row level security;
alter table public.payment_rate_limits enable row level security;

drop policy if exists finance_read_reconciliation on public.payment_reconciliation_discrepancies;
create policy finance_read_reconciliation
  on public.payment_reconciliation_discrepancies for select to authenticated
  using (public.has_staff_role(array['admin','finance_viewer','commerce_manager']));
drop policy if exists finance_read_financial_audit on public.financial_audit_log;
create policy finance_read_financial_audit
  on public.financial_audit_log for select to authenticated
  using (public.has_staff_role(array['admin','finance_viewer']));

grant select on public.payment_reconciliation_discrepancies,
  public.financial_audit_log to authenticated;
grant all on public.payment_reconciliation_discrepancies,
  public.financial_audit_log, public.payment_rate_limits to service_role;
revoke all on public.payment_rate_limits from anon, authenticated;

-- Remove generic table mutation paths. Finance writes must use the RPCs below.
drop policy if exists staff_commerce_manage on public.payments;
drop policy if exists staff_commerce_manage on public.payment_events;
drop policy if exists staff_commerce_manage on public.refunds;
drop policy if exists admin_append_payment_events on public.payment_events;
drop policy if exists cust_select_payments on public.payments;

create or replace function public.prevent_financial_record_mutation()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  raise exception 'financial history is immutable' using errcode = '42501';
end;
$$;
drop trigger if exists trg_payment_events_immutable on public.payment_events;
create trigger trg_payment_events_immutable before update or delete on public.payment_events
for each row execute function public.prevent_financial_record_mutation();
drop trigger if exists trg_financial_audit_immutable on public.financial_audit_log;
create trigger trg_financial_audit_immutable before update or delete on public.financial_audit_log
for each row execute function public.prevent_financial_record_mutation();

-- A cryptographically valid failure is notifyable only when it was applied.
-- Conflicting failure callbacks after paid are retained but never emailed.
create or replace function public.enqueue_payment_failure_notifications() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_order uuid; v_customer uuid; v_email text; v_name text; v_number text;
begin
  if new.event_type not ilike '%failed%' or new.signature_valid is not true
     or new.processing_status <> 'applied' or new.outcome <> 'applied' then
    return new;
  end if;
  select o.id,o.customer_id,c.email,c.name,o.order_number
  into v_order,v_customer,v_email,v_name,v_number
  from public.payments p join public.orders o on o.id=p.order_id
  left join public.customers c on c.id=o.customer_id where p.id=new.payment_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'payment_failed','payment',new.payment_id,'customer',v_email,v_customer,v_order,
      'order_status_failed',
      jsonb_build_object('payment_event_id',new.id,'order_id',v_order,'order_number',v_number,'customer_name',v_name),
      'payment_failed:'||new.payment_id::text||':'||coalesce(new.provider_event_id,new.id::text)
    );
  end if;
  perform public.enqueue_notification(
    'payment_failed','payment',new.payment_id,'staff',null,null,v_order,
    'staff_payment_failed',
    jsonb_build_object('payment_event_id',new.id,'order_id',v_order,'order_number',v_number),
    'payment_failed:'||new.payment_id::text||':'||coalesce(new.provider_event_id,new.id::text)||':staff',
    'operational'
  );
  return new;
end;
$$;

-- Payment attempt creation is atomic and returns the provider order id before
-- any network call, so a callback may safely arrive before initialization UI.
create or replace function public.create_payment_attempt_v2(
  p_checkout_session_id uuid,
  p_customer_id uuid,
  p_provider public.payment_provider,
  p_request_key text
) returns table (
  order_id uuid,
  order_number text,
  payment_id uuid,
  amount numeric,
  amount_minor bigint,
  currency text,
  merchant_order_id text,
  provider_redirect_url text,
  payment_status public.payment_status,
  reused boolean
)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_checkout public.checkout_sessions%rowtype;
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
  v_attempt int;
  v_item_count int;
  v_merchant_oid text;
  v_correlation uuid := gen_random_uuid();
begin
  if p_customer_id is null or p_checkout_session_id is null then
    raise exception 'customer and checkout are required' using errcode = '22023';
  end if;
  if char_length(coalesce(p_request_key,'')) not between 16 and 160 then
    raise exception 'invalid request key' using errcode = '22023';
  end if;
  if p_provider <> 'paytr' then
    raise exception 'unsupported online provider' using errcode = '22023';
  end if;

  select * into v_checkout from public.checkout_sessions
  where id = p_checkout_session_id for update;
  if not found or v_checkout.customer_id is distinct from p_customer_id then
    raise exception 'checkout not found' using errcode = 'P0002';
  end if;
  if v_checkout.status not in ('open','pending_payment','failed') then
    raise exception 'checkout is not payable' using errcode = '22023';
  end if;
  if v_checkout.expires_at <= now() then
    update public.checkout_sessions set status = 'expired' where id = v_checkout.id;
    raise exception 'checkout expired' using errcode = '22023';
  end if;
  if coalesce(v_checkout.total_amount,0) <= 0
     or round(v_checkout.total_amount * 100)::bigint > 10000000000 then
    raise exception 'checkout total is invalid' using errcode = '22023';
  end if;

  select * into v_order from public.orders where checkout_session_id = v_checkout.id;
  if not found then
    insert into public.orders (
      order_number,customer_id,checkout_session_id,status,payment_status,
      total_amount,currency,invoice_type,invoice_identity,
      delivery_address_snapshot,billing_address_snapshot,legal_snapshot
    ) values (
      'CD-' || to_char(now(),'YYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text,6,'0'),
      v_checkout.customer_id,v_checkout.id,'pending_payment','pending',
      v_checkout.total_amount,'TRY',v_checkout.invoice_type,v_checkout.invoice_identity,
      v_checkout.delivery_address_snapshot,v_checkout.billing_address_snapshot,
      v_checkout.legal_version_ids
    ) returning * into v_order;

    insert into public.order_items (
      order_id,product_id,variant_id,digital_product_id,product_snapshot,quantity,
      personalization_json,selected_addons_json,requires_proof,unit_price,total_price
    )
    select v_order.id,ci.product_id,ci.variant_id,ci.digital_product_id,
      coalesce(ci.product_snapshot,'{}'::jsonb),ci.quantity,ci.personalization_json,
      ci.selected_addons_json,ci.requires_proof,coalesce(ci.unit_price_snapshot,0),
      coalesce(ci.total_price_snapshot,0)
    from public.cart_items ci
    where ci.cart_id = v_checkout.cart_id and ci.removed_at is null;
    get diagnostics v_item_count = row_count;
    if v_item_count = 0 then raise exception 'checkout has no active items'; end if;
    update public.carts set status = 'converted' where id = v_checkout.cart_id;
  end if;

  select * into v_payment from public.payments
  where checkout_session_id = v_checkout.id and provider = p_provider
    and status in ('pending','authorized','paid','partially_refunded','refunded')
  order by attempt_number desc, created_at desc limit 1 for update;
  if found then
    return query select v_order.id,v_order.order_number,v_payment.id,v_payment.amount,
      v_payment.amount_minor,v_payment.currency,v_payment.provider_conversation_id,
      v_payment.provider_redirect_url,v_payment.status,true;
    return;
  end if;

  select coalesce(max(attempt_number),0) + 1 into v_attempt
  from public.payments where checkout_session_id = v_checkout.id and provider = p_provider;
  if v_attempt > 100 then raise exception 'payment attempt limit reached'; end if;
  v_merchant_oid := regexp_replace(v_order.order_number,'[^a-zA-Z0-9]','','g') || 'A' || v_attempt;
  insert into public.payments (
    order_id,checkout_session_id,provider,provider_conversation_id,status,amount,
    amount_minor,currency,installment_count,idempotency_key,attempt_number,
    pending_expires_at,correlation_id
  ) values (
    v_order.id,v_checkout.id,p_provider,v_merchant_oid,'pending',v_order.total_amount,
    round(v_order.total_amount*100)::bigint,'TRY',1,p_request_key || ':' || v_attempt,
    v_attempt,now() + interval '45 minutes',v_correlation
  ) returning * into v_payment;
  update public.checkout_sessions set status = 'pending_payment' where id = v_checkout.id;
  insert into public.financial_audit_log (
    action,actor_type,order_id,payment_id,correlation_id,metadata
  ) values (
    'payment_attempt_created','system',v_order.id,v_payment.id,v_correlation,
    jsonb_build_object('provider',p_provider,'attempt',v_attempt,'amount_minor',v_payment.amount_minor)
  );
  return query select v_order.id,v_order.order_number,v_payment.id,v_payment.amount,
    v_payment.amount_minor,v_payment.currency,v_merchant_oid,null::text,v_payment.status,false;
end;
$$;

create or replace function public.record_payment_initialization(
  p_payment_id uuid,
  p_succeeded boolean,
  p_redirect_url text default null,
  p_error_code text default null
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_payment public.payments%rowtype;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;
  if exists (select 1 from public.payment_events where provider = v_payment.provider
    and provider_event_id = 'init:' || v_payment.id::text) then return; end if;
  update public.payments set
    initialized_at = case when p_succeeded then now() else initialized_at end,
    provider_redirect_url = case when p_succeeded then p_redirect_url else provider_redirect_url end,
    status = case when p_succeeded then status else 'failed' end,
    last_error_code = case when p_succeeded then null else left(p_error_code,80) end,
    last_error_message = null
  where id = v_payment.id;
  insert into public.payment_events (
    payment_id,provider,provider_event_id,event_type,payload,signature_valid,
    processing_status,error_code,correlation_id,outcome,payload_digest
  ) values (
    v_payment.id,v_payment.provider,'init:' || v_payment.id::text,
    case when p_succeeded then 'checkout_initialized' else 'checkout_initialization_failed' end,
    jsonb_build_object('merchant_order_id',v_payment.provider_conversation_id),true,
    case when p_succeeded then 'applied' else 'failed' end,
    case when p_succeeded then null else left(p_error_code,80) end,
    v_payment.correlation_id,case when p_succeeded then 'applied' else 'failed' end,
    encode(digest(coalesce(v_payment.provider_conversation_id,''),'sha256'),'hex')
  );
  insert into public.financial_audit_log (
    action,severity,actor_type,order_id,payment_id,correlation_id,metadata
  ) values (
    case when p_succeeded then 'provider_initialized' else 'provider_initialization_failed' end,
    case when p_succeeded then 'info' else 'error' end,'system',v_payment.order_id,
    v_payment.id,v_payment.correlation_id,jsonb_build_object('error_code',left(p_error_code,80))
  );
end;
$$;

create or replace function public.get_customer_payment_summaries(p_order_number text default null)
returns table (
  order_number text,payment_status public.payment_status,provider public.payment_provider,
  amount numeric,currency text,created_at timestamptz
)
language sql stable security definer set search_path = public, pg_temp as $$
  select o.order_number,p.status,p.provider,p.amount,p.currency,p.created_at
  from public.payments p join public.orders o on o.id=p.order_id
  where o.customer_id=public.current_customer_id()
    and (p_order_number is null or o.order_number=p_order_number)
  order by p.created_at desc
$$;

create or replace function public.ingest_paytr_callback(
  p_merchant_order_id text,
  p_provider_event_id text,
  p_status text,
  p_total_amount_minor bigint,
  p_payment_amount_minor bigint,
  p_currency text,
  p_payload jsonb,
  p_correlation_id uuid
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_event_id uuid;
  v_outcome text;
  v_reason text;
begin
  if p_status not in ('success','failed') or p_total_amount_minor <= 0
     or p_payment_amount_minor <= 0 or p_correlation_id is null then
    raise exception 'invalid callback fields' using errcode = '22023';
  end if;
  select * into v_payment from public.payments
  where provider = 'paytr' and provider_conversation_id = p_merchant_order_id
  order by created_at desc limit 1 for update;

  if not found then
    insert into public.payment_events (
      payment_id,provider,provider_event_id,event_type,payload,signature_valid,
      processing_status,error_code,correlation_id,outcome,payload_digest
    ) values (
      null,'paytr',p_provider_event_id,'paytr.' || p_status,coalesce(p_payload,'{}'),true,
      'failed','PAYMENT_NOT_FOUND',p_correlation_id,'orphaned',
      encode(digest(coalesce(p_payload,'{}')::text,'sha256'),'hex')
    ) on conflict (provider,provider_event_id) where provider_event_id is not null do nothing
    returning id into v_event_id;
    if v_event_id is null then return jsonb_build_object('outcome','duplicate','acknowledge',true); end if;
    insert into public.payment_reconciliation_discrepancies (
      fingerprint,discrepancy_type,severity,payment_event_id,provider_reference,
      provider_amount_minor,evidence,recommended_action
    ) values (
      'orphan:' || p_provider_event_id,'orphaned_event','critical',v_event_id,
      p_merchant_order_id,p_payment_amount_minor,
      jsonb_build_object('correlation_id',p_correlation_id),
      'PayTR panelinden siparişi doğrulayın; otomatik finansal durum değiştirmeyin.'
    ) on conflict (fingerprint) do update set last_checked_at = now();
    insert into public.financial_audit_log (
      action,severity,actor_type,payment_event_id,correlation_id,provider_event_id
    ) values ('callback_unknown_order','critical','provider',v_event_id,p_correlation_id,p_provider_event_id);
    return jsonb_build_object('outcome','orphaned','acknowledge',false);
  end if;

  if exists (select 1 from public.payment_events where provider = 'paytr'
    and provider_event_id = p_provider_event_id) then
    return jsonb_build_object('outcome','duplicate','acknowledge',true,'status',v_payment.status);
  end if;
  select * into v_order from public.orders where id = v_payment.order_id for update;

  if p_currency not in ('TL','TRY') then
    v_outcome := 'currency_mismatch'; v_reason := 'CURRENCY_MISMATCH';
  elsif p_payment_amount_minor <> v_payment.amount_minor then
    v_outcome := 'amount_mismatch'; v_reason := 'AMOUNT_MISMATCH';
  elsif p_status = 'failed' and v_payment.status in ('paid','partially_refunded','refunded') then
    v_outcome := 'ignored_conflict'; v_reason := 'PAID_STATE_PRECEDENCE';
  else
    v_outcome := 'applied'; v_reason := null;
  end if;

  insert into public.payment_events (
    payment_id,provider,provider_event_id,event_type,payload,signature_valid,
    processing_status,error_code,correlation_id,outcome,payload_digest
  ) values (
    v_payment.id,'paytr',p_provider_event_id,'paytr.' || p_status,
    coalesce(p_payload,'{}'),true,case when v_outcome='applied' then 'applied' else 'ignored' end,
    v_reason,p_correlation_id,v_outcome,
    encode(digest(coalesce(p_payload,'{}')::text,'sha256'),'hex')
  ) returning id into v_event_id;

  if v_outcome in ('amount_mismatch','currency_mismatch','ignored_conflict') then
    insert into public.payment_reconciliation_discrepancies (
      fingerprint,discrepancy_type,severity,order_id,payment_id,payment_event_id,
      expected_amount_minor,provider_amount_minor,provider_reference,evidence,recommended_action
    ) values (
      'callback:' || p_provider_event_id,
      case v_outcome when 'amount_mismatch' then 'amount_mismatch'
        when 'currency_mismatch' then 'currency_mismatch' else 'conflicting_callback' end,
      case when v_outcome='ignored_conflict' then 'high' else 'critical' end,
      v_order.id,v_payment.id,v_event_id,v_payment.amount_minor,p_payment_amount_minor,
      p_merchant_order_id,jsonb_build_object('local_status',v_payment.status,'callback_status',p_status),
      'Sağlayıcı kanıtını manuel inceleyin; otomatik düzeltme yapmayın.'
    ) on conflict (fingerprint) do update set last_checked_at=now();
    insert into public.financial_audit_log (
      action,severity,actor_type,order_id,payment_id,payment_event_id,correlation_id,
      provider_event_id,metadata
    ) values (
      'callback_' || v_outcome,case when v_outcome='ignored_conflict' then 'warning' else 'critical' end,
      'provider',v_order.id,v_payment.id,v_event_id,p_correlation_id,p_provider_event_id,
      jsonb_build_object('expected_minor',v_payment.amount_minor,'provider_minor',p_payment_amount_minor)
    );
    return jsonb_build_object('outcome',v_outcome,'acknowledge',v_outcome='ignored_conflict','status',v_payment.status);
  end if;

  if p_status = 'success' then
    update public.payments set status='paid',provider_payment_id=p_merchant_order_id,
      captured_total_minor=p_total_amount_minor,paid_at=coalesce(paid_at,now()),
      last_error_code=null,last_error_message=null where id=v_payment.id returning * into v_payment;
    update public.orders set payment_status='paid',
      status=case when status='pending_payment' then 'paid' else status end
      where id=v_order.id;
    update public.checkout_sessions set status='converted' where id=v_payment.checkout_session_id;
    if v_order.status='pending_payment' then
      insert into public.order_status_events (
        order_id,from_status,to_status,actor_type,title_tr,detail_tr,metadata
      ) values (
        v_order.id,'pending_payment','paid','system','Ödeme doğrulandı',
        'Ödeme sağlayıcısı bildirimi güvenle doğrulandı.',
        jsonb_build_object('provider','paytr','payment_id',v_payment.id,'event_id',v_event_id)
      );
    elsif v_order.payment_status <> 'paid' then
      insert into public.payment_reconciliation_discrepancies (
        fingerprint,discrepancy_type,severity,order_id,payment_id,payment_event_id,
        expected_amount_minor,provider_amount_minor,provider_reference,evidence,recommended_action
      ) values (
        'state:' || v_payment.id::text || ':paid','provider_paid_local_unpaid','critical',
        v_order.id,v_payment.id,v_event_id,v_payment.amount_minor,p_payment_amount_minor,
        p_merchant_order_id,jsonb_build_object('order_status',v_order.status),
        'Sipariş operasyon durumunu ve iptal/iade gereksinimini manuel inceleyin.'
      ) on conflict (fingerprint) do update set last_checked_at=now();
    end if;
  else
    update public.payments set status='failed',last_error_code=left(p_payload->>'failed_reason_code',80),
      last_error_message=null where id=v_payment.id returning * into v_payment;
    update public.orders set payment_status='failed' where id=v_order.id and payment_status <> 'paid';
    update public.checkout_sessions set status='failed' where id=v_payment.checkout_session_id;
  end if;

  insert into public.financial_audit_log (
    action,severity,actor_type,order_id,payment_id,payment_event_id,correlation_id,
    provider_event_id,metadata
  ) values (
    case when p_status='success' then 'payment_marked_paid' else 'payment_marked_failed' end,
    case when p_status='success' then 'info' else 'warning' end,'provider',v_order.id,
    v_payment.id,v_event_id,p_correlation_id,p_provider_event_id,
    jsonb_build_object('amount_minor',v_payment.amount_minor,'captured_total_minor',p_total_amount_minor)
  );
  return jsonb_build_object('outcome','applied','acknowledge',true,'status',v_payment.status);
end;
$$;

create or replace function public.check_payment_rate_limit(
  p_route_key text,
  p_identity_hash text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_window timestamptz; v_count int;
begin
  if char_length(p_route_key) not between 3 and 80
     or char_length(p_identity_hash) not between 32 and 128
     or p_limit not between 1 and 10000 or p_window_seconds not between 1 and 86400 then
    raise exception 'invalid rate limit parameters' using errcode='22023';
  end if;
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.payment_rate_limits(route_key,identity_hash,window_started_at,request_count)
  values(p_route_key,p_identity_hash,v_window,1)
  on conflict(route_key,identity_hash,window_started_at)
  do update set request_count=public.payment_rate_limits.request_count+1
  returning request_count into v_count;
  return v_count <= p_limit;
end;
$$;

create or replace function public.detect_payment_discrepancies(
  p_batch_size int default 100,
  p_pending_age_minutes int default 45
) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_count int := 0; v_added int;
begin
  p_batch_size := greatest(1,least(p_batch_size,500));
  insert into public.payment_reconciliation_discrepancies (
    fingerprint,discrepancy_type,severity,order_id,payment_id,expected_amount_minor,
    provider_reference,evidence,recommended_action
  )
  select 'pending:'||p.id,'stuck_pending','high',p.order_id,p.id,p.amount_minor,
    p.provider_conversation_id,jsonb_build_object('pending_since',p.created_at),
    'Sağlayıcı durum sorgusu veya panel kanıtıyla manuel olarak uzlaştırın.'
  from public.payments p where p.status='pending'
    and p.created_at < now() - make_interval(mins=>p_pending_age_minutes)
  order by p.created_at limit p_batch_size
  on conflict(fingerprint) do update set last_checked_at=now();
  get diagnostics v_added=row_count; v_count:=v_count+v_added;

  insert into public.payment_reconciliation_discrepancies (
    fingerprint,discrepancy_type,severity,order_id,payment_id,expected_amount_minor,
    provider_reference,evidence,recommended_action
  )
  select 'local-paid:'||p.id,'local_paid_without_evidence','critical',p.order_id,p.id,
    p.amount_minor,p.provider_conversation_id,'{}'::jsonb,
    'Geçerli imzalı callback veya PayTR panel kanıtı olmadan durumu değiştirmeyin.'
  from public.payments p
  where p.status='paid' and not exists (
    select 1 from public.payment_events e where e.payment_id=p.id
      and e.signature_valid and e.outcome='applied' and e.event_type='paytr.success'
  ) order by p.created_at limit p_batch_size
  on conflict(fingerprint) do update set last_checked_at=now();
  get diagnostics v_added=row_count; v_count:=v_count+v_added;
  return v_count;
end;
$$;

create or replace function public.request_finance_refund(
  p_payment_id uuid,
  p_amount_minor bigint,
  p_reason public.refund_reason,
  p_confirmation text,
  p_idempotency_key text,
  p_note text default null
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_staff uuid:=public.current_staff_id(); v_payment public.payments%rowtype;
  v_order public.orders%rowtype; v_reserved bigint; v_id uuid; v_correlation uuid:=gen_random_uuid();
  v_email text; v_name text;
begin
  if v_staff is null or not public.has_staff_role(array['admin']) then
    raise exception 'finance approval permission required' using errcode='42501';
  end if;
  if char_length(coalesce(p_idempotency_key,'')) not between 16 and 160 then
    raise exception 'invalid idempotency key' using errcode='22023';
  end if;
  select id into v_id from public.refunds where idempotency_key=p_idempotency_key;
  if found then return v_id; end if;
  select * into v_payment from public.payments where id=p_payment_id for update;
  if not found or v_payment.status not in ('paid','partially_refunded') then
    raise exception 'payment is not refundable' using errcode='22023';
  end if;
  select * into v_order from public.orders where id=v_payment.order_id for update;
  if p_confirmation is distinct from v_order.order_number then
    raise exception 'high risk confirmation failed' using errcode='42501';
  end if;
  select coalesce(sum(amount_minor),0) into v_reserved from public.refunds
  where payment_id=v_payment.id and status in ('requested','approved','processing','completed')
    and provider_status <> 'cancelled';
  if p_amount_minor <= 0 or p_amount_minor > v_payment.amount_minor-v_reserved then
    raise exception 'refund exceeds refundable amount' using errcode='22023';
  end if;
  insert into public.refunds (
    order_id,payment_id,amount,amount_minor,reason,type,status,notes_internal,
    created_by,requested_by,idempotency_key,correlation_id
  ) values (
    v_order.id,v_payment.id,p_amount_minor/100.0,p_amount_minor,p_reason,
    (case when p_amount_minor=v_payment.amount_minor-v_reserved then 'full' else 'partial' end)::public.refund_type,
    'requested',left(p_note,1000),v_staff,v_staff,p_idempotency_key,v_correlation
  ) returning id into v_id;
  insert into public.financial_audit_log (
    action,actor_type,actor_staff_id,order_id,payment_id,refund_id,correlation_id,metadata
  ) values ('refund_requested','staff',v_staff,v_order.id,v_payment.id,v_id,v_correlation,
    jsonb_build_object('amount_minor',p_amount_minor,'reason',p_reason));
  select email,name into v_email,v_name from public.customers where id=v_order.customer_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'refund_requested','refund',v_id,'customer',v_email,v_order.customer_id,v_order.id,
      'refund_requested',jsonb_build_object('refund_id',v_id,'order_id',v_order.id,
        'order_number',v_order.order_number,'customer_name',v_name,'amount_minor',p_amount_minor),
      'refund_requested:'||v_id::text||':customer'
    );
  end if;
  return v_id;
end;
$$;

create or replace function public.approve_finance_refund(
  p_refund_id uuid,
  p_confirmation text
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_staff uuid:=public.current_staff_id(); v_refund public.refunds%rowtype; v_number text;
  v_customer uuid; v_email text; v_name text;
begin
  if v_staff is null or not public.has_staff_role(array['admin']) then
    raise exception 'finance approval permission required' using errcode='42501';
  end if;
  select * into v_refund from public.refunds where id=p_refund_id for update;
  if not found or v_refund.status <> 'requested' then raise exception 'refund is not requestable'; end if;
  select order_number into v_number from public.orders where id=v_refund.order_id;
  if p_confirmation is distinct from 'REFUND '||v_number then
    raise exception 'high risk confirmation failed' using errcode='42501';
  end if;
  if v_refund.requested_by=v_staff and public.current_staff_role()<>'superadmin' then
    raise exception 'refund requires a second approver' using errcode='42501';
  end if;
  update public.refunds set status='approved',approved_by=v_staff,approved_at=now()
  where id=v_refund.id;
  insert into public.financial_audit_log (
    action,actor_type,actor_staff_id,order_id,payment_id,refund_id,correlation_id,metadata
  ) values ('refund_approved','staff',v_staff,v_refund.order_id,v_refund.payment_id,
    v_refund.id,v_refund.correlation_id,jsonb_build_object('amount_minor',v_refund.amount_minor));
  select o.customer_id,c.email,c.name into v_customer,v_email,v_name
  from public.orders o left join public.customers c on c.id=o.customer_id where o.id=v_refund.order_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'refund_approved','refund',v_refund.id,'customer',v_email,v_customer,v_refund.order_id,
      'refund_approved',jsonb_build_object('refund_id',v_refund.id,'order_id',v_refund.order_id,
        'order_number',v_number,'customer_name',v_name,'amount_minor',v_refund.amount_minor),
      'refund_approved:'||v_refund.id::text||':customer'
    );
  end if;
end;
$$;

create or replace function public.mark_refund_submitted(p_refund_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_refund public.refunds%rowtype; v_customer uuid; v_email text; v_name text; v_number text;
begin
  select * into v_refund from public.refunds where id=p_refund_id for update;
  if not found or not (
    v_refund.status='approved'
    or (v_refund.status='processing' and v_refund.provider_status='failed' and v_refund.retryable)
  ) then
    raise exception 'refund is not approved' using errcode='22023';
  end if;
  update public.refunds set status='processing',provider_status='submitted',submitted_at=now(),
    provider_error_code=null,provider_error_message=null,retryable=false
  where id=v_refund.id;
  insert into public.financial_audit_log (
    action,actor_type,order_id,payment_id,refund_id,correlation_id,metadata
  ) values ('refund_submitted','system',v_refund.order_id,v_refund.payment_id,
    v_refund.id,v_refund.correlation_id,jsonb_build_object('amount_minor',v_refund.amount_minor));
  select o.customer_id,c.email,c.name,o.order_number into v_customer,v_email,v_name,v_number
  from public.orders o left join public.customers c on c.id=o.customer_id where o.id=v_refund.order_id;
  if v_email is not null then
    perform public.enqueue_notification(
      'refund_submitted','refund',v_refund.id,'customer',v_email,v_customer,v_refund.order_id,
      'refund_submitted',jsonb_build_object('refund_id',v_refund.id,'order_id',v_refund.order_id,
        'order_number',v_number,'customer_name',v_name,'amount_minor',v_refund.amount_minor),
      'refund_submitted:'||v_refund.id::text||':customer'
    );
  end if;
end;
$$;

create or replace function public.record_refund_submission(
  p_refund_id uuid,
  p_succeeded boolean,
  p_provider_reference text,
  p_error_code text default null,
  p_retryable boolean default false
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_refund public.refunds%rowtype; v_payment public.payments%rowtype; v_total bigint;
  v_from_status public.order_status; v_customer uuid; v_email text; v_name text; v_number text;
begin
  select * into v_refund from public.refunds where id=p_refund_id for update;
  if not found or v_refund.status <> 'processing' then
    raise exception 'refund is not approved' using errcode='22023';
  end if;
  if v_refund.provider_reference is not null
     and p_provider_reference is distinct from v_refund.provider_reference then
    raise exception 'provider reference is immutable' using errcode='22023';
  end if;
  select * into v_payment from public.payments where id=v_refund.payment_id for update;
  select o.status,o.customer_id,c.email,c.name,o.order_number
  into v_from_status,v_customer,v_email,v_name,v_number
  from public.orders o left join public.customers c on c.id=o.customer_id
  where o.id=v_payment.order_id for update of o;
  update public.refunds set status=(case when p_succeeded then 'completed' else 'processing' end)::public.refund_status,
    provider_status=case when p_succeeded then 'succeeded' else 'failed' end,
    provider_reference=coalesce(provider_reference,nullif(p_provider_reference,'')),
    provider_error_code=case when p_succeeded then null else left(p_error_code,80) end,
    provider_error_message=null,retryable=case when p_succeeded then false else p_retryable end,
    submitted_at=coalesce(submitted_at,now()),completed_at=case when p_succeeded then now() else null end
  where id=v_refund.id returning * into v_refund;
  if p_succeeded then
    select coalesce(sum(amount_minor),0) into v_total from public.refunds
    where payment_id=v_payment.id and status='completed' and provider_status='succeeded';
    update public.payments set status=(case when v_total>=amount_minor then 'refunded' else 'partially_refunded' end)::public.payment_status
    where id=v_payment.id returning * into v_payment;
    update public.orders set payment_status=v_payment.status,
      status=case when v_payment.status='refunded' then 'refunded' else status end
    where id=v_payment.order_id;
    if v_payment.status='refunded' then
      insert into public.order_status_events (
        order_id,from_status,to_status,actor_type,title_tr,detail_tr,metadata
      ) values (v_payment.order_id,v_from_status,'refunded','system','İade tamamlandı',
        'Ödeme sağlayıcısı iade sonucunu doğruladı.',jsonb_build_object('refund_id',v_refund.id));
    elsif v_email is not null then
      perform public.enqueue_notification(
        'refund_succeeded','refund',v_refund.id,'customer',v_email,v_customer,v_payment.order_id,
        'refund_succeeded',
        jsonb_build_object('refund_id',v_refund.id,'order_id',v_payment.order_id,
          'order_number',v_number,'customer_name',v_name,'amount_minor',v_refund.amount_minor,
          'partial',true),
        'refund_succeeded:'||v_refund.id::text||':customer'
      );
    end if;
  else
    insert into public.payment_reconciliation_discrepancies (
      fingerprint,discrepancy_type,severity,order_id,payment_id,refund_id,
      expected_amount_minor,provider_reference,evidence,recommended_action
    ) values (
      'refund:'||v_refund.id,'refund_failure','high',v_refund.order_id,v_refund.payment_id,
      v_refund.id,v_refund.amount_minor,v_refund.provider_reference,
      jsonb_build_object('error_code',left(p_error_code,80),'retryable',p_retryable),
      'PayTR iade sonucunu inceleyin; aynı idempotency anahtarıyla kontrollü tekrar deneyin.'
    ) on conflict(fingerprint) do update set last_checked_at=now();
    if v_email is not null then
      perform public.enqueue_notification(
        'refund_failed','refund',v_refund.id,'customer',v_email,v_customer,v_refund.order_id,
        'refund_failed',jsonb_build_object('refund_id',v_refund.id,'order_id',v_refund.order_id,
          'order_number',v_number,'customer_name',v_name,'amount_minor',v_refund.amount_minor),
        'refund_failed:'||v_refund.id::text||':customer'
      );
    end if;
    perform public.enqueue_notification(
      'refund_failed','refund',v_refund.id,'staff',null,null,v_refund.order_id,
      'staff_refund_failed',jsonb_build_object('refund_id',v_refund.id,'order_id',v_refund.order_id,
        'order_number',v_number,'error_code',left(p_error_code,80)),
      'refund_failed:'||v_refund.id::text||':staff','operational'
    );
  end if;
  insert into public.financial_audit_log (
    action,severity,actor_type,order_id,payment_id,refund_id,correlation_id,metadata
  ) values (
    case when p_succeeded then 'refund_succeeded' else 'refund_failed' end,
    case when p_succeeded then 'info' else 'error' end,'system',v_refund.order_id,
    v_refund.payment_id,v_refund.id,v_refund.correlation_id,
    jsonb_build_object('amount_minor',v_refund.amount_minor,'error_code',left(p_error_code,80))
  );
end;
$$;

create or replace function public.resolve_payment_discrepancy(
  p_discrepancy_id uuid,
  p_status text,
  p_notes text
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_staff uuid:=public.current_staff_id(); v_row public.payment_reconciliation_discrepancies%rowtype;
begin
  if v_staff is null or not public.has_staff_role(array['admin']) then
    raise exception 'finance review permission required' using errcode='42501';
  end if;
  if p_status not in ('investigating','resolved','dismissed')
     or char_length(trim(coalesce(p_notes,''))) not between 5 and 2000 then
    raise exception 'review notes required' using errcode='22023';
  end if;
  update public.payment_reconciliation_discrepancies set status=p_status,
    assigned_reviewer=v_staff,resolution_notes=trim(p_notes),updated_at=now(),
    resolved_at=case when p_status in ('resolved','dismissed') then now() else null end
  where id=p_discrepancy_id returning * into v_row;
  if not found then raise exception 'discrepancy not found' using errcode='P0002'; end if;
  insert into public.financial_audit_log (
    action,actor_type,actor_staff_id,order_id,payment_id,refund_id,correlation_id,metadata
  ) values ('reconciliation_'||p_status,'staff',v_staff,v_row.order_id,v_row.payment_id,
    v_row.refund_id,gen_random_uuid(),jsonb_build_object('discrepancy_id',v_row.id,'notes',left(p_notes,500)));
end;
$$;

-- Preserve Phase 2 operational transitions behind a private adapter. The
-- public RPC name becomes a finance-aware wrapper that rejects paid/refunded.
alter function public.transition_order_status(uuid,public.order_status,text)
  rename to transition_order_status_operational;
revoke all on function public.transition_order_status_operational(uuid,public.order_status,text)
  from public,anon,authenticated;

create or replace function public.transition_order_status(
  p_order_id uuid,
  p_to_status public.order_status,
  p_detail text default null
) returns public.order_status
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_to_status in ('paid','refunded') then
    raise exception 'financial transitions require verified provider evidence' using errcode='42501';
  end if;
  return public.transition_order_status_operational(p_order_id,p_to_status,p_detail);
end;
$$;
revoke all on function public.transition_order_status(uuid,public.order_status,text)
  from public,anon;
grant execute on function public.transition_order_status(uuid,public.order_status,text)
  to authenticated;

revoke all on function public.create_payment_attempt_v2(uuid,uuid,public.payment_provider,text),
  public.record_payment_initialization(uuid,boolean,text,text),
  public.ingest_paytr_callback(text,text,text,bigint,bigint,text,jsonb,uuid),
  public.check_payment_rate_limit(text,text,int,int),
  public.detect_payment_discrepancies(int,int),
  public.mark_refund_submitted(uuid),
  public.record_refund_submission(uuid,boolean,text,text,boolean)
from public,anon,authenticated;
grant execute on function public.create_payment_attempt_v2(uuid,uuid,public.payment_provider,text),
  public.record_payment_initialization(uuid,boolean,text,text),
  public.ingest_paytr_callback(text,text,text,bigint,bigint,text,jsonb,uuid),
  public.check_payment_rate_limit(text,text,int,int),
  public.detect_payment_discrepancies(int,int),
  public.mark_refund_submitted(uuid),
  public.record_refund_submission(uuid,boolean,text,text,boolean)
to service_role;

revoke all on function public.request_finance_refund(uuid,bigint,public.refund_reason,text,text,text),
  public.approve_finance_refund(uuid,text),
  public.resolve_payment_discrepancy(uuid,text,text),
  public.get_customer_payment_summaries(text)
from public,anon,authenticated;
grant execute on function public.request_finance_refund(uuid,bigint,public.refund_reason,text,text,text),
  public.approve_finance_refund(uuid,text),
  public.resolve_payment_discrepancy(uuid,text,text),
  public.get_customer_payment_summaries(text)
to authenticated;

revoke insert,update,delete on public.payments,public.payment_events,public.refunds,
  public.payment_reconciliation_discrepancies,public.financial_audit_log
from authenticated;
