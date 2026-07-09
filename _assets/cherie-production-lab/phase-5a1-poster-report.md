# Phase 5A.1 — Poster Fallback Preparation Report

Date: 2026-07-09 · Tooling: `sharp` from the project's existing `node_modules` (Next.js dependency — zero installs), Lanczos3 resampling. No AI generation, no new dependencies, no integration performed.

## Sources
- `_assets/cherie-production-lab/06-hero-poster-frames/F1-hero-full-nanobanana-4K.png` (4096×2294)
- `_assets/cherie-production-lab/07-mobile-fallbacks/G2-mobile-hands-close.png` (1152×2048)
- `_assets/cherie-production-lab/06-hero-poster-frames/F2-hero-intimate-nanobanana-4K.png` (4096×2294)

## Compression settings (final pass)
AVIF quality 65 / effort 6 · WebP quality 85 · JPEG quality 86, progressive, mozjpeg. A first pass at AVIF q55 was rejected in QA: file sizes were tiny (72 KB @2560) but fine painterly brush grain was visibly smoothed at 1:1. q65 restores the grain and still sits far under budget.

## Outputs — `public/home/hero/posters/` (22 files, 2.0 MB total)

| File | Dimensions | Size | Budget | Pass |
|---|---|---|---|---|
| poster-desktop-2560.avif | 2560×1434 | 105 KB | ≤350 KB | ✅ |
| poster-desktop-2560.webp | 2560×1434 | 159 KB | ≤550 KB | ✅ |
| poster-desktop-2560.jpg | 2560×1434 | 273 KB | — | ✅ |
| poster-desktop-1920.avif / .webp / .jpg | 1920×1075 | 73 / 106 / 175 KB | | ✅ |
| poster-desktop-1280.avif / .webp / .jpg | 1280×717 | 45 / 61 / 93 KB | | ✅ |
| poster-desktop-960.avif / .webp / .jpg | 960×538 | 31 / 42 / 60 KB | | ✅ |
| poster-mobile-1080.avif | 1080×1920 | 91 KB | ≤180 KB | ✅ |
| poster-mobile-1080.webp / .jpg | 1080×1920 | 154 / 195 KB | | ✅ |
| poster-mobile-750.avif / .webp / .jpg | 750×1333 | 32 / 64 / 83 KB | | ✅ |
| poster-dark-2560.avif / .webp | 2560×1434 | 50 / 90 KB | | ✅ |
| poster-dark-1280.avif / .webp | 1280×717 | 21 / 33 KB | | ✅ |

## Crop notes
- **poster-desktop (F1):** NO crop — full 4K frame resized only (source aspect 1.7856 kept). Ring remains at ~50% x / 48% y by construction; hands, ribbon arc, and all five maison objects intact at every width.
- **poster-mobile (G2):** NO crop — native 9:16 resized only. Ring at ~45% height. Runtime `object-cover` side-cropping on 19.5:9+ devices is safe (content is center-weighted).
- **poster-dark (F2):** 4% symmetric inset crop (164 px x / 92 px y → 3768×2110 pre-resize) to remove the painted gold frame border. A 2% test crop still showed the frame; 4% is fully clean. Composition verified intact: both silhouettes, hands, ring of light, and the wax-sealed envelope all comfortably framed; nothing meaningful lost.

## Safe-area notes
- Desktop: center 60% (hands/ring/ribbon) untouched; top 12% is quiet sky (nav-safe); bottom 15% quiet (scroll-cue-safe).
- Mobile: top 15% is empty paper (status-bar safe); bottom 20% contains only the bride's sleeve corner — CTA overlay safe; ring never occluded. Verified visually on the encoded 1080w file.

## QA findings
- Ring/hands: never cropped in any derivative (desktop/mobile are resize-only; dark variant visually verified post-crop).
- 1:1 detail inspection (2560 AVIF, ring + fingertips region) vs 4K source: brush grain and sparkle dust retained at q65; hands anatomically clean; no blocking or banding in the glow gradients.
- Crop edge check on poster-dark: no frame remnants, no AI edge noise at the new borders.
- Crushed-blacks check (poster-dark histogram): channel minimums R18/G11/B0, means 128/111/93 — the blue floor touches 0 only in the deepest corner of the source's intentional vignette; no flat crushed regions introduced by encoding. Acceptable; noted for Gate A review.
- Mobile histogram floor: 51/15/6 — healthy.

## Visual concerns (honest list)
1. poster-dark's deep vignette limits future text overlay to its upper glow zone (known from curation; unchanged by prep).
2. JPEG fallbacks are visibly softer than AVIF/WebP at same-ish sizes — they are last-resort only (≥97% of browsers will take AVIF/WebP).
3. None blocking.

## Gate A verdict per asset
- **poster-desktop (F1 set): PASS** — recommend approval.
- **poster-mobile (G2 set): PASS** — recommend approval.
- **poster-dark (F2 set): PASS** (optional alternate) — crop succeeded; composition undamaged.

## Not done (out of scope, per instructions)
No HeroOverture/HeroStage/WebGL changes, no manifest yet (5A.5), no commit, no integration. Files exist only under `public/home/hero/posters/` awaiting Gate A approval.
