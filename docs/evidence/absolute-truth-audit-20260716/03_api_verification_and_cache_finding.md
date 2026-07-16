# CHERIE DAY — API-level Staging Verification + Storefront Cache Finding

**Date:** 2026-07-16 · **Served:** `staging.cherieday.eu` → canonical `be2ef35` (`dpl_HzP77bo`)
Continuation of `02_staging_activation_result.md`. No secrets in this document.

## Constraint discovered this pass
The environment grants browsers (Safari) **read-only** and **forbids** driving them via AppleScript/System Events. The Claude-in-Chrome extension is **not connected**. Therefore all UI-interaction steps (Supabase Vault paste, Vercel env UI, Google OAuth login, admin UI login) are **owner-only** — they cannot be performed programmatically from this session. All work below was done via API/CLI/SQL only.

## Commerce data path — VERIFIED via a temporary TEST fixture (created + cleaned up)
Inserted a clearly-marked `[TEST] Denetim Fikstürü — SİLİNECEK` product (service-role SQL) with 1 variant + 1 add-on + 1 personalization field + 1 price tier, in an existing category/collection, `status=published`. Then:
- **Department listing `/magaza/davetiye` (dynamic) showed the fixture immediately** — proves the public list read-model + department mapping resolve a freshly-written product.
- The exact PDP read-model views returned the full detail: `product_variants_public` (Standart Boyut, ₺500), `product_addons_public` (1), `product_personalization_fields_public` (1), `product_price_tiers_public` (min_qty 25 → ₺450). Combined with existing PDPs rendering **200** on the shared `ProductDetail` component, variant/add-on/personalization/tier rendering is proven at the data layer.
- **Fixture fully deleted after verification** (0 rows remaining; Staging back to 48 products).

## FINDING P1 — Storefront static cache never revalidates on catalog changes
Empirical `x-vercel-cache` behaviour on the served deployment:

| Route | x-vercel-cache | Nature |
|---|---|---|
| `/magaza` (home) | **HIT** (age ~1561s) | statically cached |
| `/magaza/[department]` (dept listing) | **MISS**, `no-store` | **dynamic — reflects catalog instantly** |
| `/magaza/[department]/[slug]` (PDP) | **HIT** | statically cached, frozen |

Root cause:
- Storefront pages have **no `export const revalidate`** and no `revalidateTag`; product data fetches sit in the default force-cache Data Cache. PDPs + homepage are full-route cached and **do not time-revalidate**.
- Admin product actions (`app/admin/commerce/products/actions.ts`) call `revalidatePath('/admin/commerce/products')` and `revalidatePath(productPath(id))` where **`productPath = /admin/commerce/products/${id}`** — i.e. they revalidate **only admin paths, never the public `/magaza/**` (or homepage/koleksiyonlar) paths**.

**Impact:** when staff create/publish/re-price/add-media to a product in admin, the change appears on the **dynamic department listing**, but the **product's PDP and the homepage featured grid do not update until a redeploy** (engineering). The TEST fixture's PDP returned a cached **404** for exactly this reason (first on-demand render happened against a stale product Data Cache, then froze).

**Severity: P1 for catalog self-service.** "Can staff operate the catalog without engineering?" → currently **NO** for PDP/homepage surfaces.

**Recommended fix:** in the admin product create/update/publish/media actions, also `revalidatePath('/magaza', 'layout')` + the specific `/magaza/[department]/[slug]` and `/` (or adopt `revalidateTag('catalog')` with tagged fetches). Small, isolated change; needs its own review + redeploy.

## Resend webhook security — VERIFIED (negative paths, no real email needed)
`POST /api/webhooks/resend`:
- missing signature headers → **400**
- bogus signature → **400**
- payload > 64KB → **413**
- `GET` (wrong method) → **405**
Idempotency on duplicate `svix-id`/`provider_event_id` is enforced by `ingest_resend_delivery_event` (code-verified). Positive path (valid signature → 200 → `email_delivery_events` row) needs the signing secret and a real send — deferred to owner (Resend key).

## Still owner-only (cannot be done from this session)
| # | Item | Blocker |
|---|---|---|
| A | Insert `notification_worker_secret` / `payment_worker_secret` into Staging Vault | MCP materialises value (blocked); Safari read-only; no bash DB link. SQL on clipboard + at `scratchpad/vault_worker_secrets.sql`. |
| B | `RESEND_API_KEY` on canonical branch | Vercel write-only var; owner UI. |
| C | Supabase Google provider (Client ID/Secret) + Site URL/redirects | Not MCP-writable; owner dashboard. |
| D | Provision 1 staff account | 0 staff_users; account creation restricted + admin login needs a browser. |
| — | Google OAuth E2E, admin UI E2E, real image upload, checkout UI | Require interactive browser (read-only here) and/or A–D. |
