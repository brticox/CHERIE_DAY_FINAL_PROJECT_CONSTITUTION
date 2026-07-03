# CHERIE DAY MASTER BUILD BRIEF

Governing upgrade layer: `CHERIE_DAY_REVOLUTION_BLUEPRINT.md` defines how all sections should be raised into a connected cinematic Maison system. `HERO_CINEMATIC_SYSTEM.md` remains the governing homepage hero specification.

## 1. Final Identity

**CHERIE DAY — Wedding, Gift & Celebration Maison**

CHERIE DAY is a luxury Brand House for weddings, engagements, celebrations, gifts, invitations, digital experiences, and memories.

It is not:

- a marketplace,
- a vendor directory,
- a supplier search engine,
- a clone of The Knot,
- a generic ecommerce shop.

It is:

- a Maison,
- an editorial commerce experience,
- a celebration design house,
- a curated Product House,
- a digital invitation and wedding website studio,
- a memory and film experience,
- a planning and concierge funnel.
- a connected system of worlds, commerce, digital, memory, and CRM, as defined in `CHERIE_DAY_REVOLUTION_BLUEPRINT.md`.

Core public promise:

> Tek bir Maison, tek bir estetik dil, baştan sona kusursuz bir deneyim.

Core Turkish brand copy:

> CHERIE DAY, aşkı; davetiyeden hediyeye, dijital anıdan kutlama atmosferine kadar tek bir zarif dünyaya dönüştürür.

## 2. Non-Negotiable Rules

1. Public users never see independent vendors, supplier profiles, supplier search, vendor comparisons, saved vendors, or per-vendor reviews.
2. Any behind-the-scenes execution is presented as CHERIE DAY: CHERIE DAY ekibi, CHERIE DAY tasarım atölyesi, CHERIE DAY film ekibi, CHERIE DAY üretim ağı.
3. Products are curated Maison objects, not commodity listings.
4. Collections are worlds, not random product groups.
5. Digital tools are CHERIE DAY Digital experiences, not generic templates.
6. Commerce is quiet luxury. No noisy sale banners, star ratings, marketplace seller labels, or aggressive urgency.
7. The hero is governed by `HERO_CINEMATIC_SYSTEM.md`: the generated wedding garden video is a background ambience layer only; the real interactive hero is DOM-based transparent product layers controlled by GSAP ScrollTrigger and Lenis.
8. The site can be inspired by luxury editorial commerce systems, but must not copy another brand's visual identity.

## 3. Final Website Concept

The website should open like a cinematic Maison film, then become a shoppable, service-rich editorial platform.

User journey:

1. Feel the Maison atmosphere.
2. Understand what CHERIE DAY creates.
3. Explore experiences by celebration type.
4. Explore collections as aesthetic worlds.
5. Explore curated Maison products through `Mağaza`.
6. Enter digital invitation / wedding website flows.
7. Request film/photo/memory coverage.
8. Use planning tools or a tailor-style quiz.
9. Submit a bespoke brief or purchase selected products.

The experience should blend:

- luxury editorial storytelling,
- product-led commerce,
- concierge service,
- wedding planning logic,
- collection-based curation,
- Turkish emotional warmth.

## 4. Final Information Architecture

### Primary Navigation

- Maison
- Deneyimler
- Koleksiyonlar
- Mağaza
- Dijital
- Hatıra
- Planlama
- Rehber
- İletişim

### Utility Navigation

- Arama
- WhatsApp
- Hesabım / Giriş Yap
- Seçimlerim
- Language: Turkish only for MVP; EN/AR future localization only

### Routes

| Route | Purpose |
|---|---|
| `/` | Cinematic brand entry and primary conversion hub. |
| `/maison` | Brand story, values, design philosophy. |
| `/maison/how-it-works` | Process: discover, design, produce, coordinate, deliver. |
| `/experiences` | Celebration type overview. |
| `/experiences/[slug]` | Detailed experience page with quote CTA. |
| `/collections` | All aesthetic worlds. |
| `/collections/[slug]` | Collection world with products, digital, memory, styling. |
| `/shop` | Curated Maison product commerce/catalog. |
| `/shop/[category]` | Category listing. |
| `/shop/[category]/[product-slug]` | Product detail, personalization, inquiry/cart. |
| `/secilimlerim` | Cart / saved selections. |
| `/odeme` | Turkey-only checkout. |
| `/hesap/giris` | Customer login. |
| `/hesap/kayit` | Customer registration. |
| `/hesap` | Customer account dashboard. |
| `/hesap/siparisler` | Order history. |
| `/hesap/siparisler/[order-number]` | Order detail and tracking. |
| `/hesap/adresler` | Saved addresses. |
| `/hesap/destek` | Customer support and order inquiries. |
| `/siparis-takip` | Public order tracking entry where legally/security appropriate. |
| `/digital` | Digital invitations, websites, RSVP, QR. |
| `/digital/[type]` | Digital offering detail. |
| `/memory` | Film/photo/reels/love story offering overview. |
| `/memory/[type]` | Memory offering detail. |
| `/planning` | Planning suite overview. |
| `/planning/hayalini-tasarla` | Tailor/quiz style brief flow. |
| `/rehber` | Turkish-first SEO editorial hub. |
| `/rehber/[slug]` | Turkish guide/article page. |
| `/quote-request` | Full quote request. |
| `/contact` | Contact and WhatsApp handoff. |
| `/faq` | FAQ hub. |

## 5. Homepage Structure

1. Cinematic layered hero.
2. Maison statement.
3. How CHERIE DAY works.
4. Experiences grid.
5. Collections feature.
6. Mağaza / Maison Ürünleri editorial row.
7. Digital Love Stories preview.
8. Memory / film moment.
9. Tailor flow: `Hayalini Tasarla`.
10. Portfolio / client stories.
11. Rehber teaser.
12. FAQ teaser.
13. Final CTA.

## 6. Cinematic Hero Specification

The hero is a technical centerpiece and must be implemented as a layered web scene. The governing implementation file is `HERO_CINEMATIC_SYSTEM.md`; this section is only the executive summary.

Important rule: the generated hero video is a background ambience layer only. The real interactive hero is built from DOM-based transparent product layers controlled by GSAP ScrollTrigger and Lenis.

### Composition

- Background: locked luxury wedding garden video, full viewport, muted, looped, warm cinematic grade; ambience only, not the full hero.
- Middle atmosphere: optional semi-transparent light leaks, veil/lace shadow, soft gradient vignette.
- Foreground product layers: transparent PNG/WebP/AVIF/SVG assets positioned in 3D-like depth and controlled independently.
- Text: real HTML/CSS Turkish overlays, never burned into video.
- Motion: GSAP ScrollTrigger timeline synced to Lenis smooth scroll.
- Responsive layer positioning and reduced-motion fallback as defined in `HERO_CINEMATIC_SYSTEM.md`.

### Required Layers

- invitation card,
- envelope,
- wax seal,
- burgundy ribbon,
- champagne ribbon,
- QR card,
- cherries,
- ring box,
- lace,
- petals,
- light particles.

### Scroll Behavior

At page load:

- background video already visible,
- logo/header overlays softly,
- headline fades in,
- foreground objects rest in a balanced still-life composition.

On scroll:

- follow the 0-100% stage model in `HERO_CINEMATIC_SYSTEM.md`,
- background remains locked for the opening sequence,
- invitation and envelope drift slightly apart,
- wax seal rotates subtly,
- burgundy and champagne ribbons slide diagonally,
- QR card reveals as the digital layer,
- petals and light particles move with the least weight,
- ring box moves slowly in opposite parallax,
- text transitions from brand promise to CTA.

Reduced motion:

- replace motion timeline with static poster,
- keep all text visible,
- disable parallax/rotation.

### Hero Copy

Eyebrow: `CHERIE DAY Maison`

Headline option 1: `Aşkın en zarif günü, tek bir Maison’da şekillenir.`

Headline option 2: `Davetiyeden anıya, her detay aynı estetik dilde.`

Subcopy:

`Düğün, nişan, hediye, dijital davetiye ve anı deneyimlerini CHERIE DAY estetiğiyle tasarlar, üretir ve sunarız.`

Primary CTA: `Hayalini Tasarla`

Secondary CTA: `Koleksiyonları Keşfet`

## 7. Design Language

Mood words:

- cinematic,
- editorial,
- tactile,
- romantic,
- refined,
- warm,
- accountable.

Core motifs:

- cherry,
- wax seal,
- ribbon,
- lace,
- velvet,
- brass,
- paper,
- ring box,
- petals.

Core palette:

- ivory / paper base,
- deep burgundy,
- velvet near-black,
- cherry red accent,
- antique brass accent,
- lace/blush supporting tones.

Typography:

- elegant serif for display,
- clean humanist sans for body and UI,
- generous Turkish line lengths,
- real HTML text over images/video.

## 8. Commerce Taxonomy

### Top-Level Shop Families

- Invitations & Paper
- Digital Invitations & Websites
- Gifts & Favors
- Candles & Scented Objects
- Wax Seals & Ribbons
- Boxes & Packaging
- Table & Event Stationery
- Bride-to-Be & Bridal Objects
- Baby & Kids Celebrations
- Keepsakes & Albums
- QR & Guest Experience Cards
- Collection Sets

### Product Detail Requirements

Each product needs:

- name,
- slug,
- category,
- collection,
- product type,
- short story,
- materials,
- personalization options,
- variants,
- production time,
- media gallery,
- SEO metadata,
- related products,
- matching collection,
- inquiry/cart behavior.

### Commerce Tone

Use:

- `Seçimlerim`
- `Koleksiyonunu Tamamla`
- `Tasarım Onayı`
- `CHERIE DAY Atölyesi`
- `Özenli Teslimat`

Avoid:

- seller,
- vendor,
- marketplace,
- cheap,
- sale spam,
- star rating,
- stock urgency.

## 9. Admin / CMS / Data Model

Build around Supabase/Postgres with strict RLS.

### Public Content

- pages
- experiences
- collections
- categories
- products
- product variants
- digital offerings
- memory offerings
- portfolio projects
- galleries
- testimonials
- FAQs
- articles
- SEO metadata
- media assets

### CRM

- leads
- quote requests
- contact messages
- product inquiries
- clients
- notes
- status history
- assignments internal only

### Commerce

- carts
- cart items
- checkout sessions
- addresses
- orders
- order items
- payments
- refunds
- shipments
- inventory items
- production tasks
- product proofs
- discounts
- abandoned carts later

### Internal Operations

- suppliers internal only
- teams internal only
- assignments internal only
- internal costs
- internal notes
- audit log

## 10. Implementation Stack

Recommended:

- Next.js App Router
- TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger for cinematic hero
- Lenis for smooth scroll
- Framer Motion for small UI transitions where useful
- Supabase/Postgres/Auth/Storage
- Zod + React Hook Form for forms
- Turkey-first payment: iyzico or PayTR preferred; bank transfer fallback if needed

## 11. Acceptance Criteria

The first implementation is acceptable only if:

- no Aylora public naming remains,
- no public vendor marketplace pattern exists,
- hero uses layered assets and real text,
- site feels like a luxury Maison and editorial commerce platform,
- products are collection-led,
- forms create leads securely,
- admin/private data cannot leak publicly,
- every page has clear CTA logic,
- reduced-motion mode is respected,
- mobile hero and nav are polished.
