# SUPABASE RLS SECURITY IMPLEMENTATION PLAN

This file converts the RLS intent into implementation rules. Engineering must implement migrations from this plan before public forms, customer accounts, cart, checkout, support, or proof data go live.

## Security Principle

Fail closed. No table is publicly readable unless a specific public view or policy makes published/safe fields available.

## Roles

- `anon`: public visitor. Can read published public views. Can insert public forms. Cannot select private form submissions.
- `authenticated`: base Supabase authenticated user. Gets no broad table access by default.
- `customer`: user with `customers.auth_user_id = auth.uid()`.
- `content_editor`: draft CMS edit.
- `content_publisher`: publish/unpublish.
- `sales_crm`: leads, quote requests, contact messages, customer support read/write where assigned.
- `operations`: orders, proofs, fulfillment, shipments, production.
- `admin`: full access and role management.

## Helper Functions

Required SQL helpers:

```sql
create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
as $$
  select id from public.customers where auth_user_id = auth.uid()
$$;

create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
as $$
  select role from public.staff_users where auth_user_id = auth.uid() and is_active = true
$$;

create or replace function public.has_staff_role(allowed text[])
returns boolean
language sql
stable
security definer
as $$
  select public.current_staff_role() = any(allowed)
$$;
```

## Public Content Pattern

Direct table grants to `anon` are forbidden for CMS tables that contain draft/internal fields.

Create views:

- `categories_public`
- `collections_public`
- `products_public`
- `product_variants_public`
- `experiences_public`
- `digital_offerings_public`
- `memory_offerings_public`
- `portfolio_projects_public`
- `articles_public`
- `faqs_public`
- `seo_metadata_public`

Each public view must:

- include only safe fields,
- filter `status = 'published'`,
- exclude internal cost, supplier/team references, draft notes, unpublished media.

## Public Form Pattern

Tables:

- `leads`
- `contact_messages`
- `quote_requests`
- `newsletter_signups`

Policy:

```sql
alter table public.leads enable row level security;

create policy "anon can insert leads"
on public.leads
for insert
to anon
with check (true);

create policy "staff can read leads"
on public.leads
for select
to authenticated
using (public.has_staff_role(array['sales_crm','admin']));
```

No `anon select` policy may exist.

## Customer Ownership Pattern

Tables:

- `customers`
- `customer_addresses`
- `carts`
- `cart_items`
- `checkout_sessions`
- `orders`
- `order_items`
- `shipments`
- `tracking_events`
- `product_proofs`
- `customer_support_threads`
- `customer_support_messages`

Rule:

- customer can read own records only,
- customer can insert/update only safe fields on own records,
- operations/admin can manage fulfillment/proof/support,
- payment events are never customer-readable.

Example:

```sql
create policy "customers read own orders"
on public.orders
for select
to authenticated
using (customer_id = public.current_customer_id());

create policy "operations manage orders"
on public.orders
for all
to authenticated
using (public.has_staff_role(array['operations','admin']))
with check (public.has_staff_role(array['operations','admin']));
```

## Payment Security

Tables:

- `payments`: customer can read summarized status for own order.
- `payment_events`: admin/operations only, no customer access.

Webhook route must:

- verify provider signature/token,
- be idempotent by provider event id,
- store raw payload in `payment_events`,
- update normalized payment/order status in transaction,
- never expose raw payload publicly.

## Supplier/Internal Tables

Tables:

- `suppliers`
- `teams`
- `assignments`
- `internal_notes`
- `cost_records`

Rules:

- no `anon` grants,
- no customer grants,
- operations/admin only,
- public views must never join or expose these fields.

## Storage Buckets

| Bucket | Public | Access |
|---|---|---|
| `public-media` | yes for published assets | CMS/admin upload, public CDN read |
| `internal-media` | no | operations/admin only |
| `customer-uploads` | no | owner customer + staff |
| `proof-files` | no | owner customer read, operations/admin write |
| `legal-documents` | public for published policy PDFs/pages | admin publish only |

## Required Tests

Before launch:

- anon cannot select leads/contact/quote rows,
- anon cannot select customers/orders/payments/proofs,
- customer A cannot read customer B data,
- customer cannot read `payment_events`,
- anon cannot read suppliers/teams/assignments,
- draft products/articles are invisible,
- public views exclude internal cost,
- storage private files return forbidden without valid owner/staff session.

