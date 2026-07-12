-- CHERIE DAY · Turkey-only checkout preparation (no live payment provider yet)
alter table public.checkout_sessions
  add column if not exists invoice_type public.invoice_type not null default 'bireysel',
  add column if not exists invoice_identity jsonb not null default '{}'::jsonb,
  add column if not exists delivery_address_snapshot jsonb,
  add column if not exists billing_address_snapshot jsonb,
  add column if not exists subtotal_amount numeric(12,2),
  add column if not exists shipping_amount numeric(12,2) not null default 0,
  add column if not exists proof_acknowledged_at timestamptz,
  add column if not exists legal_version_ids jsonb not null default '{}'::jsonb,
  add column if not exists expires_at timestamptz not null default (now() + interval '60 minutes');

create unique index if not exists one_open_checkout_per_cart
  on public.checkout_sessions (cart_id)
  where status = 'open';

-- Customers may inspect their checkout but cannot forge totals, address
-- snapshots or legal evidence through the Data API.
drop policy if exists cust_update_checkout_sessions on public.checkout_sessions;
drop policy if exists cust_insert_checkout_sessions on public.checkout_sessions;
