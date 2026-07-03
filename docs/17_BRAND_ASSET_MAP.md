# BRAND ASSET MAP

This file defines canonical use for the current brand SVG source files. It prevents implementation ambiguity.

## Canonical Assets

| Role | Source File | Status | Implementation Rule |
|---|---|---|---|
| Primary wordmark / logo | `assets/brand-source/logo.svg` | Canonical | Use for header, footer, metadata previews, and core brand placement after SVG optimization. Preserve aspect ratio. |
| Monogram | `assets/brand-source/CDD.svg` | Canonical | Use for favicon exploration, loading mark, social mark, and compact brand moments after optimization. |
| Stamp / seal mark | `assets/brand-source/stamp.svg` | Canonical | Use for proof approval visuals, packaging, and approved brand signature moments. Preserve geometry. |
| Secondary source / legacy candidate | `assets/brand-source/logooo.svg` | Non-canonical until approved | Do not use in MVP public UI unless explicitly promoted. Keep as source reference only. |

## SVG Handling Rules

- Do not redraw, regenerate, stretch, skew, morph, blur, or AI-recreate any brand mark.
- Optimize with SVGO or equivalent, but do not alter visible geometry.
- Preserve `viewBox` and aspect ratio.
- Inline SVG only when styling/fill control is required and safe.
- Use image import or `<img>` when geometry lock is more important than color manipulation.
- Add accessible labels only when the mark communicates brand identity; otherwise mark decorative instances as hidden.

## Required Production Exports

Before implementation, export:

- optimized primary wordmark SVG,
- optimized monogram SVG,
- optimized stamp/seal SVG,
- favicon SVG/PNG/ICO set,
- social share image,
- email header logo,
- invoice/order logo,
- proof approval header mark.

## Implementation Names

Recommended production paths:

- `public/assets/brand/cherie-day-wordmark.svg`
- `public/assets/brand/cherie-day-monogram.svg`
- `public/assets/brand/cherie-day-stamp.svg`
- `public/favicon.svg`
- `public/icon.png`
- `public/apple-touch-icon.png`
- `public/og/cherie-day-social-share.jpg`
