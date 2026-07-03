# HERO CINEMATIC SYSTEM

Project: **CHERIE DAY — Wedding, Gift & Celebration Maison**

This is the final governing technical and creative specification for the CHERIE DAY homepage hero. If any other file describes the hero differently, this file wins.

## 1. Hero Philosophy

The CHERIE DAY hero is a **scroll-controlled cinematic Maison scene**, not a flat AI video and not a passive landing-page banner.

The hero must communicate the whole CHERIE DAY model in one living composition:

- the garden/event world,
- printed invitation and stationery,
- Maison product objects,
- digital invitation / RSVP / wedding website,
- gifts and keepsakes,
- tactile romance,
- planning and quote conversion.

The generated AI video is a **background ambience layer only**. The real interactive hero is built from DOM-based transparent product layers controlled by GSAP ScrollTrigger and Lenis.

The emotional story:

1. A luxury wedding garden is already alive in the background.
2. The Maison objects enter as separate, precise, touchable layers.
3. The paper world reveals invitation, envelope, wax seal, and ribbons.
4. The QR card reveals the digital world.
5. The ring box, cherries, lace, petals, and light particles complete the celebration world.
6. The final composition resolves into clear CTAs: `Hayalini Tasarla` and `Koleksiyonları Keşfet`.

Use Gielly Green only as inspiration for luxury editorial commerce, smooth scroll rhythm, restrained navigation, drawer/cart feeling, and product storytelling. Do not copy its hero, visual identity, text, salon structure, or layouts.

## 2. Role Of The Background Video

The background video is the living atmosphere layer only.

Use the generated luxury wedding garden video as:

- candle flicker,
- fairy lights,
- soft drapery movement,
- golden dust,
- sunset glow,
- shallow depth,
- emotional luxury,
- ambient event-world signal.

Repository source asset:

- `assets/hero-source/wedding-garden-background-source.mp4`

The background video must:

- play muted and inline,
- loop smoothly,
- stay behind all object layers,
- provide motion without carrying the story alone,
- remain stable during scroll,
- never include final website text,
- never animate or morph the invitation, logo, QR card, wax seal, ring box, or product objects.

The video may receive only minimal treatment:

- object-cover cropping,
- warm cinematic color correction if needed,
- subtle scale from `1.03` to `1.08`,
- burgundy/ivory gradient overlay for readability.

It must not become the full hero.

## 3. Role Of Transparent Foreground Layers

All important Maison objects must be independent DOM layers exported as transparent PNG/WebP/AVIF/SVG where appropriate.

Required foreground layers:

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

Each object must have its own:

- position,
- scale,
- opacity,
- rotation,
- parallax depth,
- z-index,
- transform origin,
- desktop/tablet/mobile behavior.

Meaning map:

| Layer | Meaning |
|---|---|
| Invitation / envelope | Printed invitations and stationery. |
| Wax seal | Maison signature, craft, trust, ceremony. |
| Burgundy / champagne ribbons | Packaging, textile luxury, gift world. |
| QR card | Digital invitations, RSVP, wedding websites. |
| Ring box | Engagement, wedding, gifts, keepsakes. |
| Cherries | CHERIE DAY brand motif and tactile romance. |
| Lace / petals / particles | Atmosphere, softness, celebration emotion. |
| Background garden | Event/experience world. |

## 4. Layer Stack

Recommended z-index order:

| Z | Layer | Notes |
|---|---|---|
| 0 | Page background | Ivory/velvet fallback. |
| 1 | Background video | Generated garden ambience only. |
| 2 | Background poster | Required fallback. |
| 3 | Cinematic haze / gradient | Burgundy/ivory readability layer. |
| 4 | Lace / vellum | Transparent depth only, never huge cloth. |
| 5 | Envelope | Lower-depth parallax. |
| 6 | Invitation card | Main paper layer; logo stable. |
| 7 | Wax seal | Signature focal mark. |
| 8 | Burgundy ribbon | Deeper textile layer. |
| 9 | Champagne ribbon | Lighter textile layer. |
| 10 | QR card | Digital reveal, upper/right bias. |
| 11 | Ring box | Gift/engagement layer, lower/right bias. |
| 12 | Cherries | Foreground brand accent. |
| 13 | Petals | Light object motion. |
| 14 | Light particles | Sparse atmospheric particles. |
| 15 | HTML text | Accessible Turkish copy and CTAs. |
| 16 | Header/navigation | Maison nav, menu, account, and `Seçimlerim`. |

Decorative layers should use `pointer-events: none`. Interactive CTAs and navigation remain real HTML controls above the visual scene.

## 5. Scroll Timeline

Use one pinned GSAP ScrollTrigger timeline synced with Lenis. Recommended scroll distance:

- desktop: `300vh`,
- tablet: `240vh`,
- mobile: `200vh`.

Timeline:

| Progress | Stage | Visual Behavior | Meaning |
|---|---|---|---|
| 0% | Maison intro | Background video alive; objects quiet; intro text appears. | CHERIE DAY as Maison. |
| 15% | Ribbon movement | Burgundy and champagne ribbons begin slow silk movement. | Packaging, gifts, tactile luxury. |
| 30% | Paper reveal | Envelope and invitation rise/reveal; wax seal becomes focal. | Printed invitations/stationery. |
| 45% | Digital reveal | QR card appears upper-right with subtle tilt. | Digital invitation, RSVP, wedding website. |
| 60% | Keepsake reveal | Ring box rises from lower-right with tiny sparkle. | Gifts, engagement, keepsakes. |
| 75% | Atmosphere deepens | Lace, cherries, petals, particles enrich composition. | Maison romance and celebration world. |
| 100% | CTA composition | All layers settle into balanced scene; CTAs become clear. | Planning and collection paths. |

The user must be able to leave the hero naturally. Do not trap the page in scroll-jacking.

## 6. Turkish Copy Per Stage

All text must be real HTML/CSS Turkish copy. Do not burn text into images or video.

### 0% — Maison Intro

Eyebrow:

`CHERIE DAY Maison`

H1:

`Aşkın en zarif günü, tek bir Maison’da şekillenir.`

### 30% — Paper / Gift Language

Supporting copy:

`Davetiyeden hediyeye, her detay aynı estetik dilde.`

### 45% — Digital Reveal

Headline:

`Dijital davetiye, RSVP ve düğün web sitesi deneyimleri.`

Supporting copy:

`QR karttan misafir yanıtlarına kadar dijital yolculuk CHERIE DAY diliyle tamamlanır.`

### 60% — Gifts / Keepsakes

Headline:

`Nişan, düğün ve kutlamalar için zarif Maison objeleri.`

Supporting copy:

`Kutu, kurdele, mum, hediye ve hatıra parçaları aynı koleksiyon dünyasında birleşir.`

### 100% — Conversion

Headline:

`Hayalinizdeki günü birlikte tasarlayalım.`

Primary CTA:

`Hayalini Tasarla`

Secondary CTA:

`Koleksiyonları Keşfet`

Optional tertiary link:

`Maison Ürünlerini İncele`

## 7. Motion Rules

Motion must feel slow, tactile, precise, and magical. It must never become chaotic or playful.

Layer-specific rules:

| Layer | Motion Rule |
|---|---|
| Background video | No morphing. Playback only, optional very subtle scale. |
| Invitation | Slow rise, slight parallax, stable logo/wordmark. No warping. |
| Envelope | Lower-depth parallax under the invitation. |
| Wax seal | Tiny rotation, tiny scale, optional light glint. No morphing. |
| Burgundy ribbon | Slow silk orbit/slide, deeper and heavier. Never chaotic. |
| Champagne ribbon | Softer, lighter silk motion. Never covers headline. |
| QR card | Upper-right reveal, subtle tilt, QR stays crisp and readable. |
| Ring box | Lower-right rise, slow weight, tiny sparkle only. |
| Cherries | Subtle float or micro parallax. No cartoon bounce. |
| Petals | Lightest motion, small drift only. |
| Lace | Subtle transparent depth only; never large veil/shawl/scarf/ghost cloth. |
| Light particles | Sparse shimmer, opacity low, never glitter/confetti. |
| Text | Line/word reveal, calm crossfades, no frantic letter animation. |

Recommended easing:

- large layer movement: `power2.out`,
- text reveal: `power3.out` or `expo.out`,
- final settle: `power3.out`,
- no spring/bounce in the hero.

## 8. Brand Lock Rules

The following assets are brand-locked:

- CHERIE DAY wordmark,
- CD / CDD monogram,
- stamp mark,
- wax seal mark,
- QR code,
- ribbon branding,
- invitation logo.

Brand-locked assets must never be:

- distorted,
- morphed,
- blurred,
- redrawn by AI,
- translated,
- letter-changed,
- stretched,
- skewed beyond intentional 2D card rotation,
- regenerated inside video.

Use the provided SVG files as brand source assets:

- `assets/brand-source/logo.svg`
- `assets/brand-source/stamp.svg`
- `assets/brand-source/logooo.svg`
- `assets/brand-source/CDD.svg`

For final implementation, convert or inline them cleanly, preserve aspect ratio, and use CSS color only when the SVG structure supports safe recoloring.

## 9. Responsive Rules

Use responsive CSS variables for every layer:

- `--layer-x`,
- `--layer-y`,
- `--layer-w`,
- `--layer-rotate`,
- `--layer-scale`,
- `--layer-depth`.

Avoid hardcoded desktop-only pixel positioning.

### Desktop, 1200px+

- Hero pinned at `100vh`.
- Timeline about `300vh`.
- Text block: left `7-10vw`, bottom `14-18vh`, max-width `560px`.
- Product composition: right/center, leaving text clear.
- Invitation: `28-34vw`.
- Envelope: `34-40vw`.
- QR card: `10-14vw`, upper-right of paper composition.
- Ring box: `12-16vw`, lower-right.
- Cherries: `8-12vw`, lower foreground.
- Ribbons: diagonal motion across object group, never across headline.

### Tablet, 768px-1199px

- Timeline about `240vh`.
- Text block: left/right `6vw`, bottom `12vh`.
- Product group shifts lower and more centered.
- Invitation: `38-46vw`.
- Envelope: `46-54vw`.
- QR card reveal happens later to avoid CTA overlap.
- Reduce petals/particles by about 25%.

### Mobile, up to 767px

- Timeline about `200vh`.
- Text block: left/right `24px`, bottom `10-12vh`, max-width none.
- Product composition sits in lower half.
- Invitation: `68-78vw`.
- Envelope: `78-88vw`.
- QR card: `28-34vw`, lower/side reveal.
- Ring box: `26-32vw`.
- Cherries: `20-26vw`.
- Hide or reduce one ribbon if text readability suffers.
- Lace frames edges only.
- Petals/particles reduced by about 50%.
- CTA buttons may stack vertically.

Mobile must simplify the composition and keep text readable.

## 10. Reduced Motion Fallback

Respect `prefers-reduced-motion: reduce`.

If reduced motion is enabled:

- use a static poster,
- disable ScrollTrigger pinning,
- disable parallax,
- disable rotation,
- disable particle drift,
- keep text and CTAs visible immediately,
- keep a static composed still-life,
- do not require scrolling to understand the hero.

Reduced-motion copy:

`Aşkın en zarif günü, tek bir Maison’da şekillenir.`

`CHERIE DAY; davetiyeden hediyeye, dijital davetiyeden anılara kadar her detayı tek bir estetik dilde tasarlar, üretir ve sunar.`

CTAs:

- `Hayalini Tasarla`
- `Koleksiyonları Keşfet`

## 11. Performance Rules

Performance is part of the luxury experience.

Rules:

- Background video must be compressed MP4/WebM.
- Poster image is required.
- Transparent layers must be optimized as WebP/AVIF/PNG.
- SVG brand assets must be optimized without changing geometry.
- Lazy-load non-critical assets.
- Preload only critical hero assets.
- Avoid layout shift by reserving dimensions for every layer.
- Animate only `transform` and `opacity`, not `top/left/width/height`.
- Use `will-change` only on actively animated layers.
- Avoid heavy filters on large video/layer elements during scroll.
- Use one GSAP hero timeline, not many independent scroll listeners.
- Clean up ScrollTrigger instances on route changes/unmount.
- Test desktop, tablet, mobile Safari, and mid-tier Android.

Performance targets:

- background appears immediately via poster,
- video failure still leaves a complete hero,
- no blank first viewport,
- no logo or QR blurring during animation,
- smooth Lenis scroll without jank.

## 12. Accessibility Rules

Rules:

- H1 must be real semantic HTML.
- All hero copy must be selectable and screen-reader accessible.
- Decorative layers use `aria-hidden="true"` or empty alt text.
- CTAs are keyboard-focusable links/buttons.
- Focus states are visible.
- Text contrast meets WCAG AA over moving video.
- Video is muted and plays inline.
- No required audio.
- No essential information is available only through motion.
- Reduced-motion fallback preserves meaning and conversion.

## 13. Acceptance Criteria

The hero is correct only if:

- it feels cinematic, luxury, slow, tactile, and magical,
- the generated hero video is background ambience only,
- the background is alive but stable,
- foreground objects move independently,
- DOM layers include invitation, envelope, wax seal, burgundy ribbon, champagne ribbon, QR card, cherries, ring box, lace, petals, and light particles,
- text is HTML, not burned into images,
- no logo or QR distortion occurs,
- it works on desktop, tablet, and mobile,
- it clearly introduces the Maison, products, digital, gifts, and planning paths,
- it uses GSAP ScrollTrigger and Lenis,
- reduced motion works,
- it does not look like a generic Shopify hero.

## 14. What Must Never Happen

Never:

- use the generated AI video as the full hero,
- use a flat AI video as the entire interactive experience,
- burn headline, CTA, Turkish copy, or service descriptions into media,
- let AI morph or redraw logos,
- distort the CHERIE DAY wordmark,
- distort the CD/CDD monogram,
- distort the QR code,
- blur brand marks during motion,
- use a huge veil/shawl/scarf/ghost cloth,
- introduce random new objects,
- use marketplace/vendor language,
- create vendor/supplier discovery patterns,
- build a generic Shopify-looking hero,
- use chaotic ribbon motion,
- let ribbons/lace/petals cover the headline,
- trap the user in scroll-jacking,
- ignore reduced-motion preferences.
