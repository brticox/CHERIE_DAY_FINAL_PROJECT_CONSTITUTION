-- =============================================================================
-- CHERIE DAY — 0017 · Atomic order/payment orchestration
-- Converts a frozen checkout into one order and idempotent payment attempts.
-- Provider callbacks are append-only and may update money state only through
-- the service-role-only apply_payment_event function.
-- =============================================================================

create sequence if not exists public.order_number_seq start with 1000;

create unique index if not exists orders_checkout_session_uidx
  on public.orders (checkout_session_id)
  where checkout_session_id is not null;

alter table public.payments
  add column if not exists checkout_session_id uuid
    references public.checkout_sessions (id) on delete set null,
  add column if not exists idempotency_key text,
  add column if not exists last_error_code text,
  add column if not exists last_error_message text;

create unique index if not exists payments_idempotency_key_uidx
  on public.payments (idempotency_key)
  where idempotency_key is not null;
create index if not exists payments_checkout_created_idx
  on public.payments (checkout_session_id, created_at desc);

alter table public.payment_events
  add column if not exists provider_event_id text,
  add column if not exists signature_valid boolean not null default false,
  add column if not exists processing_status text not null default 'received'
    check (processing_status in ('received','applied','ignored','failed')),
  add column if not exists error_code text;

create unique index if not exists payment_events_provider_event_uidx
  on public.payment_events (provider, provider_event_id)
  where provider_event_id is not null;

create or replace function public.create_payment_attempt(
  p_checkout_session_id uuid,
  p_customer_id uuid,
  p_provider public.payment_provider,
  p_idempotency_key text
)
returns table (
  order_id uuid,
  order_number text,
  payment_id uuid,
  amount numeric,
  currency text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_checkout public.checkout_sessions%rowtype;
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
  v_item_count int;
begin
  if p_customer_id is null or p_checkout_session_id is null then
    raise exception 'customer and checkout are required' using errcode = '22023';
  end if;
  if char_length(coalesce(p_idempotency_key, '')) not between 16 and 160 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if p_provider not in ('iyzico','paytr') then
    raise exception 'unsupported online provider' using errcode = '22023';
  end if;

  select * into v_payment
  from public.payments payment_row
  where payment_row.idempotency_key = create_payment_attempt.p_idempotency_key;
  if found then
    select * into v_order from public.orders o where o.id = v_payment.order_id;
    return query select v_order.id, v_order.order_number, v_payment.id,
      v_payment.amount, v_payment.currency;
    return;
  end if;

  select * into v_checkout
  from public.checkout_sessions cs
  where cs.id = p_checkout_session_id
  for update;
  if not found or v_checkout.customer_id is distinct from p_customer_id then
    raise exception 'checkout not found' using errcode = 'P0002';
  end if;
  if v_checkout.status not in ('open','pending_payment') then
    raise exception 'checkout is not payable' using errcode = '22023';
  end if;
  if v_checkout.expires_at <= now() then
    update public.checkout_sessions set status = 'expired' where id = v_checkout.id;
    raise exception 'checkout expired' using errcode = '22023';
  end if;
  if coalesce(v_checkout.total_amount, 0) <= 0 then
    raise exception 'checkout total is invalid' using errcode = '22023';
  end if;

  select * into v_order
  from public.orders o
  where o.checkout_session_id = v_checkout.id;

  if not found then
    insert into public.orders (
      order_number, customer_id, checkout_session_id, status, payment_status,
      total_amount, currency, invoice_type, invoice_identity,
      delivery_address_snapshot, billing_address_snapshot, legal_snapshot
    ) values (
      'CD-' || to_char(now(), 'YYMMDD') || '-' ||
        lpad(nextval('public.order_number_seq')::text, 6, '0'),
      v_checkout.customer_id, v_checkout.id, 'pending_payment', 'pending',
      v_checkout.total_amount, 'TRY', v_checkout.invoice_type,
      v_checkout.invoice_identity, v_checkout.delivery_address_snapshot,
      v_checkout.billing_address_snapshot, v_checkout.legal_version_ids
    ) returning * into v_order;

    insert into public.order_items (
      order_id, product_id, variant_id, digital_product_id, product_snapshot,
      quantity, personalization_json, selected_addons_json, requires_proof,
      unit_price, total_price
    )
    select v_order.id, ci.product_id, ci.variant_id, ci.digital_product_id,
      coalesce(ci.product_snapshot, '{}'::jsonb), ci.quantity,
      ci.personalization_json, ci.selected_addons_json, ci.requires_proof,
      coalesce(ci.unit_price_snapshot, 0), coalesce(ci.total_price_snapshot, 0)
    from public.cart_items ci
    where ci.cart_id = v_checkout.cart_id and ci.removed_at is null;

    get diagnostics v_item_count = row_count;
    if v_item_count = 0 then
      raise exception 'checkout has no active items' using errcode = '22023';
    end if;

    update public.carts set status = 'converted' where id = v_checkout.cart_id;
  end if;

  insert into public.payments (
    order_id, checkout_session_id, provider, status, amount, currency,
    installment_count, idempotency_key
  ) values (
    v_order.id, v_checkout.id, p_provider, 'pending', v_order.total_amount,
    'TRY', 1, p_idempotency_key
  ) returning * into v_payment;

  update public.checkout_sessions
  set status = 'pending_payment'
  where id = v_checkout.id;

  return query select v_order.id, v_order.order_number, v_payment.id,
    v_payment.amount, v_payment.currency;
end;
$$;

create or replace function public.apply_payment_event(
  p_payment_id uuid,
  p_provider_event_id text,
  p_event_type text,
  p_status public.payment_status,
  p_provider_payment_id text,
  p_provider_conversation_id text,
  p_amount numeric,
  p_signature_valid boolean,
  p_payload jsonb,
  p_error_code text default null,
  p_error_message text default null
)
returns public.payment_status
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'payment not found' using errcode = 'P0002'; end if;

  if exists (
    select 1 from public.payment_events pe
    where pe.provider = v_payment.provider
      and pe.provider_event_id = p_provider_event_id
  ) then
    return v_payment.status;
  end if;

  insert into public.payment_events (
    payment_id, provider, provider_event_id, event_type, payload,
    signature_valid, processing_status, error_code
  ) values (
    v_payment.id, v_payment.provider, p_provider_event_id, p_event_type,
    coalesce(p_payload, '{}'::jsonb), p_signature_valid,
    case when p_signature_valid then 'applied' else 'ignored' end,
    p_error_code
  );

  if not p_signature_valid then return v_payment.status; end if;
  if p_amount is distinct from v_payment.amount then
    raise exception 'payment amount mismatch' using errcode = '22023';
  end if;
  if v_payment.status in ('paid','refunded','partially_refunded')
     and p_status in ('pending','failed','cancelled') then
    return v_payment.status;
  end if;

  update public.payments set
    status = p_status,
    provider_payment_id = coalesce(p_provider_payment_id, provider_payment_id),
    provider_conversation_id = coalesce(p_provider_conversation_id, provider_conversation_id),
    paid_at = case when p_status = 'paid' then coalesce(paid_at, now()) else paid_at end,
    last_error_code = p_error_code,
    last_error_message = left(p_error_message, 500)
  where id = v_payment.id
  returning * into v_payment;

  select * into v_order from public.orders where id = v_payment.order_id for update;
  if p_status = 'paid' then
    update public.orders set status = 'paid', payment_status = 'paid'
      where id = v_order.id and status = 'pending_payment';
    update public.checkout_sessions set status = 'converted'
      where id = v_payment.checkout_session_id;
    if to_regclass('public.order_status_events') is not null
       and v_order.status = 'pending_payment' then
      insert into public.order_status_events (
        order_id, from_status, to_status, actor_type, title_tr, detail_tr, metadata
      ) values (
        v_order.id, 'pending_payment', 'paid', 'system', 'Ödeme doğrulandı',
        'Ödeme sağlayıcısı bildirimi güvenle doğrulandı.',
        jsonb_build_object('provider', v_payment.provider, 'payment_id', v_payment.id)
      );
    end if;
  elsif p_status in ('failed','cancelled') then
    update public.orders set payment_status = p_status where id = v_order.id;
  end if;

  return v_payment.status;
end;
$$;

revoke all on function public.create_payment_attempt(uuid, uuid, public.payment_provider, text)
  from public, anon, authenticated;
revoke all on function public.apply_payment_event(uuid, text, text, public.payment_status,
  text, text, numeric, boolean, jsonb, text, text)
  from public, anon, authenticated;
grant execute on function public.create_payment_attempt(uuid, uuid, public.payment_provider, text)
  to service_role;
grant execute on function public.apply_payment_event(uuid, text, text, public.payment_status,
  text, text, numeric, boolean, jsonb, text, text)
  to service_role;
grant usage, select on sequence public.order_number_seq to service_role;
