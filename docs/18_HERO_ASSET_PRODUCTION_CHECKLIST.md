# HERO ASSET PRODUCTION CHECKLIST

This file turns `03_HERO_CINEMATIC_SYSTEM.md` and `05_ASSET_MANIFEST.md` into a production checklist. It does not replace them.

## Source Assets

Use only repository-local source assets:

- `assets/hero-source/wedding-garden-background-source.mp4`
- `assets/hero-source/garden-still-reference.png`
- `assets/hero-source/still-life-wax-seal-cherry-ribbon.png`
- `assets/hero-source/envelope-wax-seal-reference.png`
- `assets/hero-source/invitation-card-reference.png`
- `assets/hero-source/burgundy-ribbon-reference.png`
- `assets/hero-source/champagne-ribbon-reference.png`
- `assets/hero-source/qr-card-reference.png`
- `assets/hero-source/ring-box-reference.png`
- `assets/hero-source/seal.png`
- `assets/brand-source/*.svg`

## Required Final Hero Outputs

Recommended production directory:

- `public/assets/hero/`

Required files:

- [ ] `wedding-background-loop.mp4`
- [ ] `wedding-background-loop.webm`
- [ ] `wedding-background-poster.jpg`
- [ ] `layer-invitation-card.webp`
- [ ] `layer-envelope.webp`
- [ ] `layer-wax-seal.webp`
- [ ] `layer-ribbon-burgundy.webp`
- [ ] `layer-ribbon-champagne.webp`
- [ ] `layer-qr-card.webp`
- [ ] `layer-cherries.webp`
- [ ] `layer-ring-box.webp`
- [ ] `layer-lace.webp`
- [ ] `layer-petals.webp`
- [ ] `layer-light-particles.webp` or CSS/canvas implementation

## Acceptance Checks

- [ ] Every foreground layer has a transparent background.
- [ ] No headline, CTA, Turkish copy, or service text is burned into media.
- [ ] Logo, monogram, QR, stamp, seal, and ribbon branding remain crisp.
- [ ] Background video works as ambience only.
- [ ] Poster creates a complete first viewport if video fails.
- [ ] Assets are optimized for desktop and mobile.
- [ ] Layer dimensions are documented.
- [ ] Mobile composition does not cover text or CTAs.
- [ ] Reduced-motion static composition is available.
- [ ] Usage rights are known and documented.

## Timeline State References To Produce

Before coding, create visual references or screenshots for:

- 0% Maison intro,
- 30% paper reveal,
- 45% digital reveal,
- 60% keepsake reveal,
- 75% atmosphere deepening,
- 100% CTA composition.
