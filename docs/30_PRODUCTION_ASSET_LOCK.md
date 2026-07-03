# PRODUCTION ASSET LOCK

This file records the current production-candidate asset kit.

## Current Production Candidate Folder

`assets/production/`

Brand:

- `assets/production/brand/logo-primary.svg`
- `assets/production/brand/logo-mark.svg`
- `assets/production/brand/stamp.svg`
- `assets/production/brand/favicon.svg`
- `assets/production/brand/og-image.jpg`

Hero:

- `assets/production/hero/wedding-background-loop.mp4`
- `assets/production/hero/wedding-background-poster.jpg`
- `assets/production/hero/layer-invitation-card.png`
- `assets/production/hero/layer-envelope-wax-seal-combined.png`
- `assets/production/hero/layer-wax-seal.png`
- `assets/production/hero/layer-ribbon-burgundy.png`
- `assets/production/hero/layer-ribbon-champagne.png`
- `assets/production/hero/layer-qr-card.png`
- `assets/production/hero/layer-ring-box.png`
- `assets/production/hero/layer-still-life-cherry-ribbon-reference.png`

## Important Limitation

The current environment has `sips` but not `ffmpeg`, `cwebp`, or `magick`. Therefore:

- MP4 was copied as the current loop candidate.
- Poster JPG was generated from the garden still.
- PNG layers were promoted as production candidates from source references.
- WebM/WebP final exports remain media-pipeline tasks.

## Build Rule

Implementation may use `assets/production` first. If a production file is missing, the build must fail visibly during QA rather than silently using random source/reference assets.

## Final Media Pipeline Tasks

Before launch:

- create WebM from MP4,
- compress MP4 for web,
- export transparent layers as WebP/PNG pairs,
- verify alpha channels,
- create mobile-safe sizes,
- optimize SVG artboards,
- create favicon PNG sizes if needed,
- validate OG image.

## Asset Acceptance

- No burned-in text.
- No distorted logo/stamp/QR.
- No giant cloth/veil motif.
- No unbounded file sizes.
- Hero text remains HTML/CSS.
- Reduced-motion fallback uses poster + static layers.

