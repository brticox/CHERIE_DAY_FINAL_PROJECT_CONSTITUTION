# Opening Experience — Concept Approval

This file is the approved creative concept required by `03_HERO_CINEMATIC_SYSTEM.md` before implementation of the CHERIE DAY homepage/landing experience may begin. It is self-contained: no other creative package needs to be consulted to build from it.

Governing rule reminder: this concept must never block access to store, inquiry, account, or checkout at any scroll depth, and must never distort official brand marks (`logo.svg`, `CDD.svg`, `stamp.svg`).

---

## 1. Concept Name

**Türkçe:** Güvercin Bahçesi — Yaşayan Davet
**English:** The Dove Garden — A Living Invitation

## 2. Creative Rationale

A warm, romantic, vintage watercolor garden world — not a dark curtain/seal opening, not a generic wedding hero, not a template ecommerce grid. The dove is the recurring emotional motif (the Disney-style "memorable character") that carries the visitor from a sealed invitation into a living celebration atlas, then into real commerce gateways, without ever delaying shopping clarity. The structural discipline (4 primary gateways, secondary paths, real routes, MVP/Premium phasing) prevents the emotional world from becoming decorative noise.

## 3. First Viewport Composition (First 3 Seconds)

Golden-hour watercolor sky, soft champagne/burgundy tones. Clouds part like watercolor wash, not like fabric curtains. A folded vintage invitation letter rises and drifts in the frame. The seal (`stamp.svg`-inspired emblem) opens gently, like a flower blooming — never a crack or break. A single white dove is released, tracing an elegant arc; its wingtrail leaves a burgundy/champagne silk ribbon that draws the CHERIE DAY monogram in light. By 3 seconds, the real HTML wordmark (`logo.svg`) and a one-line positioning statement fade in at the lower third. At ~2.8s, a non-blocking micro scroll cue appears: `Bahçeye Adım Atın ↓` (13px, ~70% opacity, gentle 4px breathing motion, never competing with the main composition).

## 4. First 8–12 Second Clarity Moment

The dove's ribbon trail becomes a garden path; the camera pulls back to reveal a watercolor garden world (rose trellises, drifting petals, warm golden light) blended with realistic product objects. Four large, real-text gateway labels appear on the path: **Davetiye · Dijital Davetiye · Nişan & Söz · Organizasyon & Kutlamalar**. Below them, a smaller elegant secondary path shows four connected nodes: **Hediyelikler · Yüzükler & Aksesuarlar · Galeri & Değerlendirmeler · Şehir Hizmetleri**. All labels are real HTML text, never burned into imagery.

## 5. Full Scroll Storyboard

| # | Section | Tone | World Continuity | Required CTA |
|---|---|---|---|---|
| 1 | Hero / Bahçe Açılışı | Poetic Luxury | Sky → seal → dove → ribbon | `Bahçeye Adım Atın` |
| 2 | Atlas Gateways | Balanced Commerce | Ribbon → garden path, 4 gateways + 4 secondary nodes | 4 gateway anchors + 4 node anchors |
| 3 | Davetiye | Balanced Commerce | Rose trellis, envelope opens, cards fall like petals | `Kişiselleştir` · `Sepete Ekle` |
| 4 | Dijital Davetiye | Balanced Commerce | Ribbon becomes light circuit, phone/screen previews bloom | `Dijital Davetiye Oluştur` |
| 5 | Nişan & Söz | Balanced Commerce | Candlelight + velvet texture, tray/isteme/söz tabs | `Kişiselleştir` · `Teklif Al` |
| 6 | Organizasyon & Kutlamalar | Balanced Commerce | Garden becomes a soft stage/backdrop, service tabs | `Teklif Al` · `Rezervasyon Başlat` |
| 7 | Hediyelikler | Balanced Commerce | Rose petals, gift boxes | `Sepete Ekle` |
| 8 | Yüzükler & Aksesuarlar | Balanced Commerce | Velvet ring box, one dramatic light moment | `Randevu Al` |
| 9 | Galeri & Değerlendirmeler | Balanced Commerce | Real project photography, framed | Gallery filtering |
| 10 | Güven / Ödeme / Yasal | Direct Practical | Calm flowerbed, flat light | Legal links |
| 11 | Footer | Balanced Commerce | Ribbon ties into a bow around the monogram | `Alışverişe Başla` · `Bize Danışın` |

Continuity rule: every section shares the same paper-grain texture overlay and the same golden light-temperature grade — no section is allowed to look like a pasted-in template.

## 6. Motion System (Section-by-Section)

| Section | Scroll Animation | Mouse Interaction | Hover/Tap | Technology | Mobile Simplification | Reduced-Motion Fallback |
|---|---|---|---|---|---|---|
| Hero | One-time automatic sequence (≤3s), not scroll-gated | Dove reacts subtly (4-8px), ribbon soft-follows cursor | None yet | Video + Canvas hybrid | Single poster + short fade, no live sequence variance | One static, already-resolved frame |
| Atlas Gateways | SVG path-draw, staggered fade (80ms) | Clouds drift independently, gateways glow on hover | Hover: grow+glow; tap: anchor scroll | CSS/GSAP | Path-draw skipped, gateways appear instantly | All labels appear instantly, no animation |
| Davetiye | One-time envelope-open transition, then standard fade-up grid | Petals nudge gently near cursor | Card lifts on hover (shadow increase) | CSS/GSAP | Envelope-open plays once, grid instant | Envelope-open skipped, grid shown directly |
| Dijital Davetiye | Ribbon morphs into thin light line, mockups fade in | Mockup slight parallax tilt | Preview grows on hover | CSS | Tilt disabled | Static mockup |
| Nişan & Söz | Candle flicker (subtle, looping), tab-slide | Candlelight intensifies slightly near cursor | Tab tap/click, product hover | CSS keyframe | Flicker disabled, steady light | Flicker fully off |
| Organizasyon & Kutlamalar | Garden-to-stage crossfade, tab-slide | Light rig slight parallax | Tab switch (Doğum Günü/Baby Shower/DJ/Şehir) | CSS/GSAP | Crossfade shortened | Static scene image |
| Hediyelikler | Standard fade-up grid | Petals drift gently | Card grows on hover | CSS | Drift disabled | Static |
| Yüzükler & Aksesuarlar | Velvet box opening moment (**single Three.js scene**) | Box tilts slightly with cursor (real 3D) | Box opens slightly on hover | **Three.js** (one low-poly object, this section only) | 3D replaced by pre-rendered still/short video | Static product photo |
| Galeri & Değerlendirmeler | Masonry/horizontal fade-in | Card grows on hover | Hover lifts card, tap opens gallery | CSS | 2-column grid | Static grid |
| Güven / Ödeme / Yasal | Simple fade-in, minimal motion | None (deliberately calm) | Legal link underline on hover | CSS | Unchanged | Unchanged |
| Footer | Ribbon ties into a bow (once, brief) | None | Standard link hover | CSS | Bow animation skipped, static logo | Static |

General rule: only Hero and Yüzükler carry heavier motion budget. Everything else stays CSS/GSAP-level — the page feels alive, never noisy.

## 7. 2.5D / 3D Decision

Default: 2.5D layered parallax (CSS transform + scroll-linked offset). Real Three.js is reserved for exactly one moment: the Yüzükler & Aksesuarlar velvet ring-box object. Hero uses a video+Canvas hybrid, not WebGL, to avoid full-page WebGL weight. Result: one Three.js scene site-wide.

## 8. Route / CTA Map

| Gateway/Path | Route | Route Type | CTA |
|---|---|---|---|
| Davetiye | `/shop/davetiye` → `/shop/davetiye/[slug]` | product_category → product_detail | `İncele` · `Kişiselleştir` · `Sepete Ekle` |
| Dijital Davetiye | `/digital/digital-invitation` + `/shop/dijital-davetiye` | experience_service + digital_product | `Önizle` · `Dijital Davetiye Oluştur` |
| Nişan & Söz | `/experiences/nisan-soz` + `/shop/hediyelik`, `/shop/nisan-tepsisi` | experience_service + product_category | `Kişiselleştir` · `Teklif Al` |
| Organizasyon & Kutlamalar | `/planning/hayalini-tasarla` + `/quote-request` (+ `/experiences/dogum-gunu`, `/experiences/baby-shower`) | experience_service + quote_request | `Teklif Al` · `Rezervasyon Başlat` |
| Hediyelikler | `/shop/hediyelik` | product_category | `Sepete Ekle` |
| Yüzükler & Aksesuarlar | `/shop/yuzuk-aksesuar` *(route gap — see below)* | product_category (proposed) | `Randevu Al` |
| Galeri & Değerlendirmeler | `/portfolio/[slug]`, embedded in `/experiences/[slug]` and `/collections/[slug]` | gallery_review | Gallery filtering |
| Şehir Hizmetleri | City field inside `/quote-request` | city_availability (embedded field) | `Şehrimde Hizmet Var mı?` |
| Reservation (general) | `/quote-request` with `type=reservation` | reservation | `Rezervasyon Başlat` |

**Route gap and resolution:** `15_INFORMATION_ARCHITECTURE.md` has no dedicated top-level route for "Yüzükler & Aksesuarlar." Rather than inventing a new top-level route, the cleanest fix is a new category slug inside the existing dynamic `/shop/[category]/[product-slug]` pattern — `/shop/yuzuk-aksesuar` — supported by the existing admin Category CRUD (`09_COMMERCE_BIBLE.md`). "Müzik & DJ" similarly has no dedicated route; it stays an add-on embedded inside the relevant `/experiences/[slug]` page via the existing `services`/`packages` internal model (`07_PLATFORM_ARCHITECTURE.md` §7). No new top-level routes are proposed.

## 9. Site Chrome Specification

### 9.1 Header

Centered logo (`logo.svg`). Transparent over the hero (no background, thin gold underline only) → on scroll: `--cherie-ivory` background, 8-12px blur, thin brass underline, 220ms fade (`cubic-bezier(0.22,1,0.36,1)`). Left nav group: `Maison` · `Deneyimler` · `Koleksiyonlar`. Right nav group: `Mağaza` · `Dijital` · `Planlama` · `Rehber`. Utility icons (right edge): search, `Hesabım`, `Seçimlerim` (with count badge), WhatsApp. Mega menu opens on click/intentional hover for `Mağaza` and `Deneyimler`, columns with a featured-collection image, never text-only. Hover state: thin gold underline grows left-to-right, 140ms, no color change.

### 9.2 Mobile Drawer

Right-side slide+fade, 200ms, body scroll locked. Canonical labels (`31_MOBILE_UX_ACCEPTANCE_LOCK.md`): `Deneyimler` · `Koleksiyonlar` · `Mağaza` · `Dijital` · `Hatıra` · `Planlama` · `Rehber` · `İletişim`. Top of drawer: the 4 primary gateways as large icon cards. Below: secondary paths (Hediyelik/Yüzük/Galeri/Şehir) as compact icon rows. Fixed bottom block: `Hesabım` · `Seçimlerim` · `Sipariş Takibi`, then `WhatsApp ile Yaz` button. Background: `--cherie-paper` with light paper texture.

### 9.3 Footer

Multi-column desktop, accordion groups mobile. Brand area: `logo.svg` + closing line ("Hikâyeniz, tam burada filizleniyor."). Store departments: Davetiye · Dijital Davetiye · Hediyelik · Nişan Tepsisi · Mum · Masa Kartları · QR Kartları. Services: Nişan & Söz · Doğum Günü · Baby Shower · Kurumsal · Planlama/Hayalini Tasarla. Support: Hesabım · Siparişlerim · Sipariş Takibi · Destek · SSS. Legal: KVKK Aydınlatma Metni · Mesafeli Satış Sözleşmesi · Ön Bilgilendirme Formu · İade ve İptal Politikası · Gizlilik Politikası · Çerez Politikası. Payment badges: iyzico, PayTR, TROY, Visa, Mastercard, AMEX (single row, muted tone). Background `--cherie-velvet`, thin static brass line at top (the ribbon's final, calm state).

### 9.4 Cookie Consent

Slim paper strip (max ~72px desktop) fixed at the bottom, never a modal, never covers the hero. Appears ~3.5s after page load (after the hero sequence completes). Copy: "CHERIE DAY deneyiminizi güzelleştirmek için çerez kullanıyoruz. Detaylar Çerez Politikamızda." Buttons: `Tümünü Kabul Et` (primary, brass fill) · `Tercihleri Yönet` (secondary, outline) · `Yalnızca Zorunlu` (text link). Settings panel expands in-place (not a separate modal): Zorunlu (locked, explained) · Analitik (toggle) · Pazarlama (toggle). Mobile: full-width strip, stacked buttons, `Tümünü Kabul Et` always in thumb-reach.

### 9.5 Search Overlay

Top-anchored half-overlay (top ~60% of viewport, page blurs beneath), `--cherie-ivory` background, paper texture. Placeholder: "Davetiye, hediye, nişan… ne arıyorsunuz?" Live suggestions in three groups: Categories, Products (with thumbnail+price), Services (with `Teklif ile` tag). Empty state (no query yet): popular chips — `Davetiye Modelleri` · `Nişan Tepsisi` · `Dijital Davetiye` · `Doğum Günü Konsepti`. No-results state: "Aradığınızı bulamadık, ama sizin için bulmaya hazırız." → `Bize Danışın`. Desktop: `/` or search icon opens, `Esc` closes, arrow-key navigation. Mobile: full screen, auto-focus keyboard, visible close (X).

### 9.6 Cart Drawer / Seçimlerim

Right-side drawer, 260ms slide+fade, body scroll locked. Title: `Seçimlerim`. Product rows: image, name, collection/category, personalization summary, quantity, price. Proof-required items carry a `Tasarım Onaylı` badge. Quote/reservation items appear in a separate "Talepleriniz" sub-section (never mixed with priced cart items), showing `Teklif ile` instead of a price. Fixed bottom CTA: `Güvenli Ödeme`. Secondary CTA when quote/proof items present: `Bize Danışın`. Empty state: "Seçimleriniz henüz boş. Size yakışacak parçaları birlikte bulalım." → `Mağazaya Göz At`. Mobile: full-height drawer, large tap targets, sticky bottom CTA.

### 9.7 Login / Account Entry

Header entry point via `Hesabım` icon: dropdown/compact modal if logged out, direct link to `/hesap` if logged in. Desktop: centered, calm modal (no visual clutter, no playful animation). Mobile: full page (`/hesap/giris`). Copy: "Hesabınıza dönün, hikâyenize kaldığınız yerden devam edin." Buttons: `Giriş Yap` · `Üye Ol` · `Şifremi Unuttum`. Form fields are fully standard/functional — the only decorative touch is a small static `CDD.svg` monogram at the top, nothing else.

### 9.8 Trust / Payment / Legal Strip

"Güvenli Ödeme · Özenli Teslimat · Tasarım Onayıyla Üretim" plus payment badges (iyzico/PayTR/TROY/Visa/Mastercard/AMEX) and KVKK/Mesafeli Satış links. Appears in three places: (1) homepage Güven/Ödeme/Yasal section near the end, (2) footer always, (3) checkout directly above the payment step.

### 9.9 General UI Kit

| Element | Style |
|---|---|
| Buttons | Primary: `--cherie-burgundy` fill, `--cherie-ivory` text, 6px radius, hover darkens (140ms). Secondary: outline, brass border. |
| Category chips | Paper texture, thin brass border; selected state fills `--cherie-lace` |
| Tabs | Underline style, active tab = brass underline + bold weight |
| Cards | 6px radius, `0 12px 32px rgba(31,25,23,0.08)` shadow, hover lifts 2-4px (260ms) |
| Product badges | `Yeni` (small brass tag), `Tasarım Onaylı` (icon), `Sınırlı Üretim` (rare, restrained) |
| Quote/reservation badges | `Teklif ile` (neutral gray-brass), `Randevu Gerekli` — never red/urgent tone |
| Hover/tap | Light/shadow/size change preferred over color change |
| Focus state | 2px `--cherie-focus` ring, 2px offset, mandatory on all interactive elements |
| Loading/skeleton | Paper-toned shimmer (`--cherie-mist` range), never a bare spinner |
| Reduced-motion | All hover-scale/parallax/shimmer disabled, instant state-change, color/contrast feedback preserved |

## 10. Higgsfield Phase 1 Production Table (Launch-Required, Full and Self-Contained)

**Base negative prompt (applies to every asset below unless noted):** `cartoon, anime, 3D render look, plastic texture, low quality, blurry, watermark, text artifacts, extra fingers, distorted anatomy, oversaturated neon colors, dark horror mood, childish illustration, stock photo cliché, generic wedding clipart, logo distortion, fake or illegible typography, jpeg artifacts, overexposed highlights, cheap glitter, low-resolution upscale artifacts`

**Brand/logo safety governing rule:** No Higgsfield asset may generate, recreate, or approximate the actual `logo.svg`, `CDD.svg`, or `stamp.svg` geometry. Where a scene conceptually involves the seal or the monogrammed ribbon, Higgsfield generates only the surrounding material (blank wax texture, plain ribbon fabric) with **no legible lettering or monogram shapes**; the real vector brand mark is composited on top in code/design tooling afterward.

---

**01 — `cd-hero-sky-garden-bg-desktop.webp`**
Purpose: Hero/Atlas background, primary watercolor world establishing shot.
Model: `soul_location`. Aspect: 21:9. Variant: Desktop (mobile companion: `cd-hero-sky-garden-bg-mobile.webp`, 9:16, same prompt, vertical recomposition, focal point centered-upper).
Prompt: "Vintage luxury watercolor painting of a soft golden-hour sky blending into a romantic rose garden, champagne and burgundy tones, delicate watercolor clouds, soft golden light, painterly texture, elegant and adult mood, editorial luxury atelier aesthetic, negative space at center-bottom for text overlay."
Negative prompt: base + `busy composition, cluttered foreground, saturated pink, cartoon flowers`.
Output: WebP, q90, target <500KB.
Phase: Launch-Required.
Brand/logo safety: No brand marks present in this asset; none required.

**02 — `cd-hero-seal-bloom-poster.jpg`**
Purpose: Hero poster frame (static fallback + reduced-motion state).
Model: `cinematic_studio_2_5`. Aspect: 4:5. Variant: Desktop crop + `cd-hero-seal-bloom-poster-mobile.jpg` (1:1 crop).
Prompt: "Macro cinematic still of a circular wax-seal-style emblem gently opening like a blooming flower, blank impression with no visible lettering, warm golden light, burgundy and brass tones, luxury stationery texture, shallow depth of field, romantic and soft, not dark or ominous."
Negative prompt: base + `legible letters, monogram lettering, readable text, cracked/broken seal, dark shadows, horror mood`.
Output: JPG, q85, target <300KB.
Phase: Launch-Required.
Brand/logo safety: **Critical** — seal must render as a blank emboss pattern. The real `CDD.svg`/`stamp.svg` mark is composited on top in code, never generated by the model.

**03 — `cd-hero-seal-bloom-loop.webm` (+ `.mp4` fallback)**
Purpose: Hero opening video loop (2-3s, single video asset for the whole page).
Model: `cinematic_studio_3_0`, 1080p, genre: intimate. Aspect: 16:9. Variant: Desktop + `cd-hero-seal-bloom-loop-mobile.webm` (9:16).
Prompt: "Same seal-blooming scene as the poster, seal opens gently over 2 seconds, soft golden light bloom, slow graceful motion, no fast cuts, no camera shake."
Negative prompt: base + `legible letters, monogram lettering, fast motion, jump cuts, dark mood`.
Output: WebM (VP9) + MP4 (H.264) fallback, target <2MB total.
Phase: Launch-Required.
Brand/logo safety: Same as #02 — blank seal only, real mark composited in code.

**04 — `cd-hero-dove-still-transparent.webp`**
Purpose: Dove hero element (fallback still, used in Hero and referenced visually in Atlas Gateways).
Model: `nano_banana_pro`. Aspect: 1:1, transparent background. Variant: single asset, reused at multiple sizes.
Prompt: "Elegant white dove in flight, wings gently spread, realistic watercolor-photo hybrid style, warm golden rim light, isolated on transparent background, luxury editorial style, adult refined mood."
Negative prompt: base + `pigeon-like awkward pose, aggressive wing flapping, cartoon bird, multiple doves`.
Output: WebP with alpha channel, target <150KB.
Phase: Launch-Required.
Brand/logo safety: None required (no brand marks present).

**05 — `cd-hero-ribbon-plain.webp`**
Purpose: Silk ribbon element for Hero and as the visual basis for the site-wide navigation hairline.
Model: `nano_banana_pro`. Aspect: elongated custom (~1:4), transparent. Variant: single asset.
Prompt: "Flowing silk ribbon in burgundy and champagne tones, softly lit, plain fabric with visible folds and sheen, no text or emblem, luxury stationery product photography, isolated on transparent background."
Negative prompt: base + `visible text, monogram lettering, embroidered letters, stiff/plastic ribbon look`.
Output: WebP with alpha, target <150KB.
Phase: Launch-Required.
Brand/logo safety: **Critical** — ribbon must be generated completely plain. The real `CDD.svg` monogram is overlaid as a vector element in code wherever the ribbon "carries" the brand mark (per constitution rule: brand marks are never AI-regenerated).

**06 — `cd-gateway-davetiye-hero.webp`**
Purpose: Davetiye gateway hero image (Atlas Gateways + Davetiye section header).
Model: `nano_banana_pro`, 4K. Aspect: 4:3. Variant: Desktop + `cd-gateway-davetiye-hero-mobile.webp` (4:5).
Prompt: "Elegant flat-lay of a luxury wedding invitation suite under a rose trellis, vintage watercolor garden background blended softly with realistic paper texture, burgundy and champagne palette, warm golden light, editorial product photography, adult luxury mood."
Negative prompt: base + `generic wedding clipart, plastic paper look, cluttered flat-lay`.
Output: WebP, q90, target <500KB.
Phase: Launch-Required.
Brand/logo safety: If any invitation card mockup shows a logo, it must be a placeholder mark, not the real wordmark — real product photography replaces this at catalog launch.

**07 — `cd-gateway-dijital-davetiye-hero.webp`**
Purpose: Dijital Davetiye gateway hero image.
Model: `seedream_v4_5`. Aspect: 4:3. Variant: Desktop + `cd-gateway-dijital-davetiye-hero-mobile.webp` (4:5).
Prompt: "Soft golden-lit phone mockup displaying an elegant abstract digital invitation design (no legible brand text), watercolor garden bokeh background, luxury editorial style, warm romantic tone."
Negative prompt: base + `visible real UI chrome, legible app icons, generic stock phone mockup`.
Output: WebP, q90, target <500KB.
Phase: Launch-Required.
Brand/logo safety: On-screen mockup content must be abstract/placeholder, not a rendering of real brand wordmark.

**08 — `cd-gateway-nisan-soz-hero.webp`**
Purpose: Nişan & Söz gateway hero image.
Model: `nano_banana_pro`. Aspect: 4:3. Variant: Desktop + `cd-gateway-nisan-soz-hero-mobile.webp` (4:5).
Prompt: "Velvet engagement presentation tray with candlelight, rose petals, burgundy and brass tones, warm golden light, luxury Turkish engagement ceremony styling, editorial still life."
Negative prompt: base + `crowded composition, plastic tray, artificial flowers look`.
Output: WebP, q90, target <500KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**09 — `cd-gateway-organizasyon-hero.webp`**
Purpose: Organizasyon & Kutlamalar gateway hero image.
Model: `soul_location`. Aspect: 4:3. Variant: Desktop + `cd-gateway-organizasyon-hero-mobile.webp` (4:5).
Prompt: "Elegant garden event setup with soft draped fabric backdrop, warm string lighting, floral arch, golden hour ambiance, luxury event styling, adult refined mood, no people, no crowd."
Negative prompt: base + `visible faces, crowd of people, cheap balloon decor`.
Output: WebP, q90, target <500KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**10 — `cd-product-davetiye-01.webp` … `cd-product-davetiye-06.webp` (template row, 6 files)**
Purpose: First visible product grid inside the Davetiye gateway section.
Model: `nano_banana_pro`, 4K. Aspect: 4:5. Variant: Desktop + matching `-mobile` 1:1 crop for each of the 6.
Prompt (template, vary the bracketed detail per file): "Single luxury wedding invitation card, [specific paper/finish detail, e.g. ivory cotton paper with gold foil edge / burgundy wax seal detail / letterpress typography mockup with placeholder text], soft studio lighting with a hint of the watercolor garden palette, editorial product photography, shallow depth of field."
Negative prompt: base + `legible real brand text, generic clipart border`.
Output: WebP, q90, target <300KB each.
Phase: Launch-Required.
Brand/logo safety: Any typographic mockup text on the card must be Latin/Turkish placeholder names ("Elif & Kaan" style), never the real CHERIE DAY wordmark rendered by the model.

**11 — `cd-product-dijital-davetiye-01.webp` … `-04.webp` (template row, 4 files)**
Purpose: First visible product grid inside the Dijital Davetiye gateway section.
Model: `seedream_v4_5`. Aspect: 4:5 (phone-mockup framing). Variant: Desktop + `-mobile` variants.
Prompt (template): "Phone mockup showing an elegant abstract digital invitation theme, [specific palette/motif variation], soft golden bokeh background, luxury editorial style."
Negative prompt: base + `real app UI chrome, legible third-party branding`.
Output: WebP, q90, target <300KB each.
Phase: Launch-Required.
Brand/logo safety: Same as #07.

**12 — `cd-product-nisan-soz-01.webp` … `-04.webp` (template row, 4 files)**
Purpose: First visible product grid inside the Nişan & Söz gateway section (tepsi/isteme/hediyelik tabs).
Model: `nano_banana_pro`. Aspect: 4:5. Variant: Desktop + `-mobile` variants.
Prompt (template): "[Specific object, e.g. velvet engagement tray / isteme gift set / söz favor box], candlelight and rose petal accents, burgundy and brass tones, editorial still-life product photography."
Negative prompt: base + `plastic-looking velvet, artificial candle flame`.
Output: WebP, q90, target <300KB each.
Phase: Launch-Required.
Brand/logo safety: None required.

**13 — `cd-product-organizasyon-01.webp` … `-04.webp` (template row, 4 files)**
Purpose: First visible concept grid inside the Organizasyon & Kutlamalar gateway section (event/birthday/baby shower tabs).
Model: `soul_location` / `cinematic_studio_2_5`. Aspect: 3:2. Variant: Desktop + `-mobile` 4:5 crop.
Prompt (template): "[Specific concept, e.g. garden wedding backdrop / birthday table styling / baby shower soft-cloud decor], warm golden light, luxury event styling, adult refined mood, no visible faces."
Negative prompt: base + `visible faces, childish balloon clipart, plastic decor look`.
Output: WebP, q90, target <400KB each.
Phase: Launch-Required.
Brand/logo safety: None required.

**14 — `cd-ring-box-still.webp`**
Purpose: Yüzükler & Aksesuarlar section still (fallback for the Three.js moment + mobile/low-end device replacement + texture reference for the 3D asset).
Model: `nano_banana_pro`. Aspect: 1:1. Variant: Desktop + `cd-ring-box-still-mobile.webp` (same crop, optimized weight).
Prompt: "Open velvet ring box with soft golden spotlight, burgundy velvet interior, elegant ring presentation, macro luxury product photography, warm romantic light, shallow depth of field."
Negative prompt: base + `visible hands, cluttered background, harsh flash lighting`.
Output: WebP, q90, target <300KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**15 — `cd-path-hediyelik-icon.webp`**
Purpose: Secondary path node icon — Hediyelikler.
Model: `nano_banana_pro`. Aspect: 1:1. Variant: single asset (small display size, no separate mobile needed).
Prompt: "Small elegant gift box with rose petals, soft watercolor background, warm golden light, minimal luxury composition."
Negative prompt: base + `cluttered bow, plastic gift wrap look`.
Output: WebP, q85, target <100KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**16 — `cd-path-yuzuk-icon.webp`**
Purpose: Secondary path node icon — Yüzükler & Aksesuarlar.
Model: `nano_banana_pro`. Aspect: 1:1.
Prompt: "Delicate ring on soft fabric, warm golden light, minimal luxury macro composition."
Negative prompt: base.
Output: WebP, q85, target <100KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**17 — `cd-path-galeri-icon.webp`**
Purpose: Secondary path node icon — Galeri & Değerlendirmeler.
Model: `nano_banana_pro`. Aspect: 1:1.
Prompt: "Small framed vintage photograph corner with watercolor garden texture, soft golden light, minimal composition."
Negative prompt: base + `visible faces in the framed photo`.
Output: WebP, q85, target <100KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**18 — `cd-path-sehir-icon.webp`**
Purpose: Secondary path node icon — Şehir Hizmetleri.
Model: `recraft_v4_1` (model_type: vector). Aspect: 1:1.
Prompt: "Delicate watercolor-style map motif with a single soft golden light point, elegant minimal illustration, not literal cartography, luxury editorial style."
Negative prompt: base + `literal road map, GPS pin icon, cartoon map`.
Output: WebP/SVG, q85, target <80KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**19 — `cd-trust-strip-bg.webp`**
Purpose: Güven/Ödeme/Yasal section background texture.
Model: `cinematic_studio_2_5`. Aspect: 21:9. Variant: Desktop + `cd-trust-strip-bg-mobile.webp` (16:9).
Prompt: "Calm, softly lit paper texture background, muted champagne tones, minimal and quiet, no strong subject, luxury stationery texture."
Negative prompt: base + `dramatic lighting, strong subject matter, busy composition`.
Output: WebP, q85, target <200KB.
Phase: Launch-Required.
Brand/logo safety: None required.

**20 — `cd-footer-bow-composition.webp`**
Purpose: Footer decorative composition (ribbon tied into a bow, framing the brand area).
Model: `nano_banana_pro`. Aspect: custom wide (~21:9). Variant: Desktop + `cd-footer-bow-composition-mobile.webp` (4:5).
Prompt: "Silk ribbon in burgundy and champagne tones tied into an elegant bow, soft golden light, plain fabric with no text or emblem, luxury product photography, isolated composition suitable for framing a logo area."
Negative prompt: base + `visible text, monogram lettering`.
Output: WebP, q90, target <300KB.
Phase: Launch-Required.
Brand/logo safety: **Critical** — bow must be plain fabric only. The real `logo.svg`/`CDD.svg` is placed in code as a separate vector layer at the center of the bow composition, never generated.

## 11. Higgsfield Phase 2 Production Queue (Premium, Post-Launch)

| Filename | Purpose | Model | Aspect | Notes |
|---|---|---|---|---|
| `cd-premium-dove-flight-loop.webm` | Full dove flight video (replaces static still in Hero) | `cinematic_studio_3_0` | 16:9 (+9:16 mobile) | Loads only on high-performance/desktop connections |
| `cd-premium-ribbon-physics-ref.webm` | Motion reference for cursor-reactive ribbon animation | `cinematic_studio_3_0` | 16:9 | Reference only, not embedded directly — informs coded motion curve |
| `cd-premium-petals-layer-01/02/03.webp` | Transparent parallax petal layers | `nano_banana_pro` (transparent) | Custom | Three depth layers for Davetiye/Hediyelikler parallax |
| `cd-premium-ring-3d-texture-ref.webp` | Texture/lighting reference for the Three.js ring-box object | `nano_banana_pro` | 1:1 | Feeds the 3D asset's material map, not used directly as an image |
| `cd-premium-envelope-open-frames-01..04.webp` | Intermediate frames for a richer envelope-open transition | `cinematic_studio_2_5` | 4:5 | Used in Davetiye section premium transition |
| `cd-premium-organizasyon-ambient-loop.webm` | Ambient ombré loop for the Organizasyon stage backdrop | `soul_location` reference → animated in `cinematic_studio_2_5` | 16:9 | Silent, low-motion loop |

All Phase 2 assets are loaded only via feature-detection (device capability + connection speed + `prefers-reduced-motion: no-preference`); otherwise the page renders the Phase 1 experience, which is already complete and launch-ready on its own.

## 12. Mobile Plan

Ribbon becomes a thin vertical line; dove reduces to a single short flutter in Hero only (no continuous flight loop). Parallax and the Three.js ring scene are disabled, replaced by static imagery. Scroll-scrub is replaced by section-based one-time triggers. First-viewport payload target: <1.5MB. Tabbed sections (Nişan & Söz, Organizasyon & Kutlamalar) collapse into vertical accordions.

## 13. Reduced-Motion Plan

Hero renders as one static, already-resolved frame (seal open, dove flown, ribbon drawn). Atlas Gateways path-draw is skipped — all labels appear instantly. All envelope-open transitions, candle flicker, and the Three.js ring scene are replaced by static imagery. The hero micro-CTA breathing animation stops. Color, contrast, and focus-state feedback are always preserved regardless of motion settings.

## 14. Performance Budget

Mobile Lighthouse ≥85 target (≥90 preferred). Only one video asset (`cd-hero-seal-bloom-loop`) loads by default. First-viewport payload <1.5MB. The single Three.js scene is feature-detected and gracefully degrades on low-end devices. All imagery served as WebP/AVIF with responsive `srcset`.

## 15. Risks and Solutions

| Risk | Solution |
|---|---|
| Watercolor + photographic product mismatch reads as "pasted stock photo" | Single consistent CHERIE DAY watercolor-texture overlay applied to every product still |
| Dove/petal/ribbon motifs overused, reading as childish | Maximum 2-3 moving objects on screen at once, full motion reserved for Hero only |
| Three.js performance risk | Confined to one section, mobile/low-end always falls back to a static image |
| Cookie banner or header interrupting the cinematic opening | Cookie banner delayed ~3.5s and bottom-anchored as a thin strip; header starts fully transparent |
| Route inconsistency (Yüzükler, Müzik & DJ) | No invented top-level routes; both resolved via existing dynamic `/shop/[category]` pattern and `/experiences/[slug]` add-on model |
| Commerce sacrificed for spectacle | Every section's required output is at least one real CTA — no section is approved without it |
| Accessibility gaps from decorative layers | All decorative layers `aria-hidden`; headline/CTA/price text always exists as parallel real HTML |

## 16. Acceptance / Rejection Tests

**Accepted if:** the first 3 seconds produce a warm, romantic WOW (not dark/dramatic); by 8-12 seconds the visitor sees at least 6 named departments; every one of the 11 sections carries a real CTA; scroll/click access is never trapped; Three.js is confined to one section; mobile Lighthouse ≥85; every route resolves to real constitution IA or an explicitly justified extension; all public copy is Turkish; brand marks are never AI-regenerated.

**Rejected if:** the opening reverts to a dark curtain/seal break; any department (Davetiye, Dijital Davetiye, Nişan & Söz, Organizasyon & Kutlamalar, Hediyelikler, Yüzükler & Aksesuarlar, Galeri & Değerlendirmeler, Şehir Hizmetleri) is missing from the homepage; the cinematic sequence delays shopping clarity past 12 seconds; the page is weighed down by full-page WebGL; a route is invented that contradicts the real IA; any asset shows a distorted or AI-regenerated brand mark.
