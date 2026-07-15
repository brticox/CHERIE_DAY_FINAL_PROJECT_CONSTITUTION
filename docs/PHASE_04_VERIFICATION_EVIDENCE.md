# PHASE 4 — PUBLIC EXPERIENCE VERIFICATION EVIDENCE

**Branch:** `phase/04-public-commerce-completion-20260714`
**Base:** `91fbd75` · **Backup ref:** `backup/pre-phase04-20260714`
**Date:** 2026-07-15 · Not pushed, not merged, not deployed.

## 1. Executive verdict
The public customer journey (DISCOVER → BUY/REQUEST → FOLLOW) is coherent and
launch-review-ready. **All 37 `PagePlaceholder` routes have been replaced** with
real, honest, premium Turkish pages. No navigation link lands on a placeholder.
Store discovery, the product decision environment, services intake context,
account honesty, SEO sitemap/schema/OG, error/empty states, responsiveness and
accessibility were completed and verified. No protected (auth/payments/admin/
supabase/hosted/middleware) path was touched.

## 2. Quality gates (final)
| Gate | Before | After |
|---|---|---|
| `npm run typecheck` | pass | **pass** |
| `npm run lint` (`--max-warnings=0`) | pass | **pass (0 warnings)** |
| `npm test -- --run` | 64 passed | **70 passed** (6 files) |
| `npm run build` | pass | **pass** (dev server stopped first) |
| Shared First Load JS | 103 kB | **103 kB (no regression)** |

## 3. Placeholder routes completed (37)
- **Maison (3):** `/maison`, `/maison/nasil-calisir`, `/maison/dunyalar`
- **Store (4):** `/magaza/one-cikanlar`, `/magaza/yeni`, `/magaza/koleksiyon/[slug]`, `/magaza/etkinlik/[slug]`
- **Planning (3):** `/planlama/butce-rehberi`, `/planlama/kontrol-listesi` (interactive), `/planlama/zaman-akisi`
- **Help (3):** `/yardim` (rewired), `/yardim/[topic-slug]`, `/yardim/siparisim`
- **Digital (5):** `/dijital/{dijital-davetiye,dugun-web-sitesi,misafir-listesi,qr,rsvp}`
- **Memory (6):** `/hatira/{photo,film,drone,reels,love-story,event-trailer}`
- **Account (12):** `/hesap/{adresler,bildirimler,degerlendirmelerim,favoriler,tekliflerim,tercihler,dijital,tasarim-onaylari,rezervasyonlar,rezervasyonlar/[id],destek,destek/[id]}`
- **States (1):** `/hata`
- **Payment guidance (1, presentation only):** `/odeme/depozito/[reservation-number]`

## 4. Responsive (no horizontal overflow)
`scrollWidth === innerWidth` verified via DOM at **320px** (kontrol-listesi) and
**375px** (magaza, maison/nasil-calisir, PDP). Reset to desktop after.

## 5. Media / photography (Phase 4D)
`MediaFrame` + `ProductGallery` give an honest, art-directed colour/material
**sample** (monogram + collection palette) — never a bare "görsel yok" and never
a fabricated photo. Real images (when produced) show a thumbnail rail + keyboard
zoom lightbox. Aspect ratio always reserved (no CLS).

## 6. SEO
- `sitemap.xml`: **14 → 168 URLs** (departments, products, collections ×2,
  experiences ×2, services, cities, articles, help, legal). Verified 200 + 168 `<url>`.
- `opengraph-image`: dynamic `next/og` brand card, verified `200 image/png`.
- Breadcrumb schema (all pages via `Breadcrumbs`), Product schema (PDP), FAQ
  schema (help topics) present. `/arama` + `/hesap` + `/odeme` noindex.

## 7. Protected-boundary confirmation
`git diff --name-only 91fbd75..HEAD` touches only `app/(site)/**`,
`components/{commerce,content}/**`, `app/{sitemap.ts,opengraph-image.tsx}`,
`lib/data/help.ts`, `tests/`, `docs/`. **No** `app/auth`, `components/auth`,
`lib/auth`, `lib/notifications`, `lib/payments`, `app/api/payments|webhooks`,
`app/admin`, `components/admin`, `supabase`, `.github/workflows`, `vercel.json`,
`.env*`, `middleware.ts`, or `next.config.mjs` change.

## 8. Cross-agent dependencies (not implemented here — by design)
1. **Canonical domain** — `NEXT_PUBLIC_SITE_URL` must be `https://cherieday.eu`
   in prod; staging/preview must stay noindex. Hosted env owned by other agent.
2. **Account live data** — favorites/addresses/notifications/reservations/quotes/
   support binding needs auth+DB owned by the identity agent. Delivered as honest
   staged states + `requireUser` guard; no protected code touched.
3. **Guest order tracking** — `/siparis-takip` currently redirects to login via
   `lib/auth/guards` (protected). True guest lookup needs an orders-by-number+email
   endpoint owned by the orders/auth agent.
4. **Real photography & OG raster** — asset dependency; honest samples used meanwhile.
5. **Catalog copy** — live DB carries placeholder product descriptions
   (e.g. "Örnek ürün açıklaması (yer tutucu)") and empty collection palettes; these
   are DB content, not front-end, and swap in transparently.

## 9. Known limitation of this verification
Authenticated account pages (`/hesap/**`) redirect to login without a session, so
their staged visuals were verified by gates + code review, not live browser (no
test session available; account creation is out of scope). Guard behaviour is
identical to already-working sibling pages (`/hesap`, `/hesap/siparisler`).
