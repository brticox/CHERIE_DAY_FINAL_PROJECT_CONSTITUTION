# PHASE 4 — PUBLIC ROUTE & CONVERSION DEFECT REGISTER

**Branch:** `phase/04-public-commerce-completion-20260714`
**Base HEAD:** `91fbd75` (`docs(admin): complete Phase 2 excellence evidence`)
**Backup ref:** `backup/pre-phase04-20260714` → `91fbd75`
**Date:** 2026-07-14
**Scope:** Public customer-facing surfaces only (`app/(site)/**`, `components/{commerce,services,content,layout,forms,ui}`, `lib/data/**`, `content/seed/**`, public SEO routes). No protected area is touched (see boundary confirmation below).

---

## 1. Parallel-work boundary confirmation

The following are owned by the parallel hosted-activation / identity agent and are **NOT** modified in this phase:

`app/auth/**`, `components/auth/**`, `lib/auth/**`, `lib/notifications/**`, `lib/payments/**`, `app/api/payments/**`, `app/api/webhooks/**`, `app/admin/**`, `components/admin/**`, `supabase/**`, `.github/workflows/**`, `vercel.json`, `.env.example`, Sentry config, `middleware.ts` (unless an unavoidable, proven public bug requires it — then documented as a dependency, not implemented).

The homepage hero (`app/(site)/page.tsx` + `lib/home/**` WebGL stage) is **protected** — no redesign; audit only.

---

## 2. Test / gate baseline (before edits)

| Gate | Result |
|---|---|
| `npm test -- --run` | **64 passed** (5 files: admin-permissions, media-validation, admin-product-validation, legal, notifications) |
| Dev server | boots on `:3000`, renders public chrome + seed content |
| Supabase | `.env.local` has URL/anon set → data layer reads `*_public` views with graceful seed fallback (`lib/data/source.ts`); every page renders credible Turkish seed even with no DB |

---

## 3. Architecture facts that shape the work

- **Data layer** (`lib/data/*`) is view-first with seed fallback. Rich domain types already exist (`Product` w/ variants, tiers, addons, personalization fields, colors, materials; `ServicePackage`, `ServiceCity`, `DigitalProduct`, `Experience`, `Article`, `Faq`, `Testimonial`, `PortfolioProject`). Building against these is safe and needs **no schema/auth change**.
- **Design system**: `cherie-*` tokens (ivory/paper/lace/brass/burgundy/velvet/ink/soft-ink), `cherie-container`, `cherie-kicker`, `text-h1/h2/h3`, `font-display`, `ease-cherie`, `rounded-card`, `shadow-lift`. Shared blocks: `PageHeader`, `Breadcrumbs`, `MediaFrame`, `EmptyState`/`ErrorState`/`CardGridSkeleton`, `Badge`, `Button`, `JsonLd`.
- **Placeholder engine**: `components/layout/page-placeholder.tsx` renders title + generic note *"Bu bölüm yakında CHERIE DAY özenli içerikleriyle tamamlanacak."* — **37 routes** import it. These are the primary defects.
- **Media reality**: `MediaFrame` fallback shows an initial + *"Görsel hazırlanıyor"*. Phase 4D requires a more refined honest presentation (material/palette), not a bare "hazırlanıyor" label. No real product photography exists — placeholders must stay honest, no fabricated photos.
- **SEO baseline**: `app/sitemap.ts` is static top-level only (14 URLs, no dynamic product/service/collection/city/article entries). `robots.ts` disallows `/admin,/hesap,/odeme`. `buildMetadata` sets canonical from `NEXT_PUBLIC_SITE_URL` (must resolve to `https://cherieday.eu` in prod — hosted config owned by other agent; documented as dependency).

---

## 4. Route inventory & classification

Legend — **State**: ✅ complete · 🟡 functional/thin · 🟠 content-thin · ⛔ placeholder · 🔒 auth-gated presentation. **Priority**: P1 launch-critical · P2 important · P3 nice-to-have · P4 de-link candidate.

### 4.1 Brand / Maison
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/maison` | Brand story / about | `maison/page.tsx` | static | ⛔ placeholder | **P2** |
| `/maison/nasil-calisir` | How it works | `maison/nasil-calisir/page.tsx` | static | ⛔ placeholder | **P2** |
| `/maison/dunyalar` | Collections-as-worlds narrative | `maison/dunyalar/page.tsx` | collections | ⛔ placeholder | **P2** |
| `/iletisim` | Contact | `iletisim/page.tsx` | form | ✅ | P1 |
| `/sss` | FAQ | `sss/page.tsx` | faqs | 🟡 (no FAQ schema) | P2 |

### 4.2 Store (Mağaza)
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/magaza` | Department + featured hub | `magaza/page.tsx` | departments, products | 🟡 (no global sort/filter entry) | P1 |
| `/magaza/[department]` | Department listing | `magaza/[department]/page.tsx` | products (filter/sort) | 🟡 elevate filters/URL-state | P1 |
| `/magaza/[department]/[product-slug]` | PDP | `.../[product-slug]/page.tsx` + `ProductDetail` | product full | 🟡 elevate media+decision env | P1 |
| `/magaza/yeni` | New arrivals | `magaza/yeni/page.tsx` | products | ⛔ placeholder | **P1** |
| `/magaza/one-cikanlar` | Featured selection | `magaza/one-cikanlar/page.tsx` | products | ⛔ placeholder | **P1** |
| `/magaza/koleksiyon/[collection-slug]` | Collection-scoped store view | `magaza/koleksiyon/[collection-slug]/page.tsx` | collection+products | ⛔ placeholder | **P2** |
| `/magaza/etkinlik/[event-slug]` | Occasion-scoped store view | `magaza/etkinlik/[event-slug]/page.tsx` | experience+products | ⛔ placeholder | **P2** |

### 4.3 Collections & Experiences
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/koleksiyonlar` | Collection index | `koleksiyonlar/page.tsx` | collections | 🟡 | P1 |
| `/koleksiyonlar/[slug]` | Collection detail | `koleksiyonlar/[slug]/page.tsx` | collection+products | 🟡 | P1 |
| `/deneyimler` | Celebration worlds index | `deneyimler/page.tsx` | experiences | 🟡 | P1 |
| `/deneyimler/[event]` | Experience detail | `deneyimler/[event]/page.tsx` | experience | 🟡 | P1 |

### 4.4 Digital (Dijital)
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/dijital` | Digital products hub | `dijital/page.tsx` | digitalProducts | 🟡 | P1 |
| `/dijital/dijital-davetiye` | Digital invitation detail | `dijital/dijital-davetiye/page.tsx` | digital | ⛔ placeholder | **P1** |
| `/dijital/dugun-web-sitesi` | Wedding site product | `dijital/dugun-web-sitesi/page.tsx` | digital | ⛔ placeholder | **P2** |
| `/dijital/misafir-listesi` | Guest-list tool product | `dijital/misafir-listesi/page.tsx` | digital | ⛔ placeholder | **P3** |
| `/dijital/qr` | QR card product | `dijital/qr/page.tsx` | digital | ⛔ placeholder | **P2** |
| `/dijital/rsvp` | RSVP product | `dijital/rsvp/page.tsx` | digital | ⛔ placeholder | **P2** |

### 4.5 Memory (Hatıra)
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/hatira` | Photo/film hub | `hatira/page.tsx` | portfolio | 🟡 (cards link nowhere) | P2 |
| `/hatira/{photo,film,drone,reels,love-story,event-trailer}` | Format detail | 6× placeholder pages | portfolio | ⛔ placeholder ×6 | **P2/P3** |

### 4.6 Services (Hizmetler) & Intake
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/hizmetler` | Service showroom | `hizmetler/page.tsx` | packages | 🟡 | P1 |
| `/hizmetler/[service-slug]` | Service detail | `hizmetler/[service-slug]/page.tsx` | package | 🟡 elevate intake context | P1 |
| `/hizmetler/sehir` | City coverage index | `hizmetler/sehir/page.tsx` | cities | 🟡 | P1 |
| `/hizmetler/sehir/[city-slug]` | City detail | `hizmetler/sehir/[city-slug]/page.tsx` | city+packages | 🟡 | P1 |
| `/teklif` | Quote request | `teklif/page.tsx` | intake form | 🟡 verify source context | P1 |
| `/randevu` | Appointment request | `randevu/page.tsx` | intake form | 🟡 verify source context | P1 |
| `/planlama/hayalini-tasarla` | Dream brief | `planlama/hayalini-tasarla/page.tsx` | intake form | 🟡 | P1 |

### 4.7 Planning (Planlama)
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/planlama` | Planning hub | `planlama/page.tsx` | static | 🟡 (links to placeholders) | P2 |
| `/planlama/butce-rehberi` | Budget guide | placeholder | static | ⛔ placeholder | **P2** |
| `/planlama/kontrol-listesi` | Checklist | placeholder | static | ⛔ placeholder | **P2** |
| `/planlama/zaman-akisi` | Timeline | placeholder | static | ⛔ placeholder | **P2** |

### 4.8 Editorial (Rehber)
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/rehber` | Article index | `rehber/page.tsx` | articles | 🟡 | P2 |
| `/rehber/[article-slug]` | Article detail | `rehber/[article-slug]/page.tsx` | article | 🟡 (no Article schema wired to page) | P2 |

### 4.9 Help & Order tracking
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/yardim` | Help center | `yardim/page.tsx` | static | 🟡 | P1 |
| `/yardim/[topic-slug]` | Help topic | placeholder | static | ⛔ placeholder | **P2** |
| `/yardim/siparisim` | Order help | placeholder | static | ⛔ placeholder | **P2** |
| `/siparis-takip` | Guest order tracking | `siparis-takip/page.tsx` | form | 🟠 (11 lines, thin) | **P1** |

### 4.10 Search & Cart
| Route | Purpose | Source | Data | State | Priority |
|---|---|---|---|---|---|
| `/arama` | Global search | `arama/page.tsx` | search index | 🟡 elevate empty/filters | P1 |
| `/secilimlerim` | Cart / selections | `secilimlerim/page.tsx` | cart | 🟡 (cart logic protected-adjacent) | P1 |
| `/odeme` | Checkout entry | `odeme/page.tsx` | cart | 🟡 (do not touch payment logic) | P1 |
| `/odeme/{basarili,basarisiz,beklemede}` | Payment status | 3 pages | static | 🟡 elevate copy only | P1 |
| `/odeme/depozito/[reservation-number]` | Deposit landing | placeholder | reservation | ⛔ placeholder (presentation only) | **P2** |

### 4.11 Account (Hesap) — auth-gated, presentation only
| Route | State | Priority |
|---|---|---|
| `/hesap` | ✅ overview | P1 |
| `/hesap/siparisler`, `/hesap/siparisler/[order-number]` | ✅ (258-line detail) | P1 |
| `/hesap/{adresler,bildirimler,degerlendirmelerim,favoriler,tekliflerim,tercihler,dijital,tasarim-onaylari}` | ⛔ placeholder ×8 | **P2/P3** |
| `/hesap/rezervasyonlar`, `/hesap/rezervasyonlar/[reservation-number]` | ⛔ placeholder ×2 | **P2** |
| `/hesap/destek`, `/hesap/destek/[thread-id]` | ⛔ placeholder ×2 | **P3** |
| `/hesap/{giris,kayit,sifremi-unuttum,sifreyi-yenile}` | 🔒 auth (identity agent owns) | **do not modify logic** |

### 4.12 Legal (Kurumsal) — Phase 1 owned
| `/kurumsal` + 13 doc routes | ✅ legal content engine (Phase 1). Presentation audit only; **no legal copy edits** | P1 |

---

## 5. De-link / honesty decisions (proposed)

- **Build (P1/P2):** all Maison, all `/dijital/*`, `/magaza/{yeni,one-cikanlar,koleksiyon,etkinlik}`, `/planlama/*`, `/yardim/*`, `/siparis-takip`, `/hatira/*`, `/odeme/depozito`.
- **Account placeholders:** convert to honest, useful "staged" states with real value explanation + contextual support routing (support@/orders@/payments@/legal@). No auth/DB writes.
- **De-link candidates if not truthfully fillable:** `/dijital/misafir-listesi` and `/hesap/destek/*` may become honest "hazırlanıyor" staged states rather than nav-promoted routes. Decision recorded per route as built.

## 6. Cross-agent dependencies (not implemented here)
1. **Canonical domain** — `NEXT_PUBLIC_SITE_URL` must be `https://cherieday.eu` in prod; staging/preview must stay `noindex`. Hosted env owned by other agent.
2. **Favorites persistence** — requires auth/DB write owned by identity agent; Phase 4 delivers presentation + contract only.
3. **Real product/OG photography** — asset production dependency; placeholders stay honest.
4. **Live catalog/service data** — seed drives launch-review; DB swap is transparent via `*_public` views.

## 7. Commit plan (adapted from mission)
1. `docs(public): publish route and conversion defect register` ← this file
2. `feat(public): complete launch navigation and route honesty`
3. `feat(store): elevate catalog discovery and collection journeys`
4. `feat(store): rebuild product decision and media experience`
5. `feat(search): improve Turkish discovery filters and empty states`
6. `feat(services): complete public planning and intake journeys`
7. `feat(account): refine customer-facing account workspaces`
8. `feat(seo): add dynamic sitemap metadata and social images`
9. `fix(a11y): complete public accessibility and responsive polish`
10. `perf(public): reduce client work and media regressions`
11. `test(public): add route links metadata and UX regression coverage`
12. `docs(public): publish Phase 4 verification evidence`
