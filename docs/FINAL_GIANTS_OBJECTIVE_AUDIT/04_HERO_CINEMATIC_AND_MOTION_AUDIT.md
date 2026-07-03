# Hero Cinematic And Motion Audit

## Verdict

The hero system is conceptually strong and technically feasible, but not production-ready. It is worth the complexity only if the final assets are produced and the mobile version is simplified.

## What Works

- Background video as ambience only is the correct rule.
- DOM-based transparent foreground layers are more controllable than a flat AI video.
- GSAP ScrollTrigger + Lenis is an appropriate stack.
- Real HTML/CSS Turkish copy preserves SEO, accessibility, and responsiveness.
- Reduced-motion fallback is explicitly required.

## Technical Risks

1. Too many layers can damage mobile performance.
2. Pinned scroll can feel like a scroll trap if the timeline is too long.
3. Safari autoplay and video decode can fail without poster/fallback.
4. QR/logo/stamp clarity can degrade if raster layers are scaled badly.
5. Background video can dominate LCP if not lazy/optimized.
6. Z-index and responsive positioning can become fragile.
7. Reduced-motion may be underbuilt if treated as a late patch.

## Asset Gaps

Missing build targets include:

- final loop MP4,
- WebM,
- poster image,
- transparent invitation card layer,
- transparent envelope layer,
- transparent wax seal layer,
- burgundy ribbon layer,
- champagne ribbon layer,
- QR card layer,
- cherries layer,
- ring box layer,
- lace/petal/particle treatments.

## Acceptance Tests

Before implementation acceptance:

- Desktop 1440px hero renders nonblank and readable.
- Mobile 390px hero renders nonblank and does not trap scroll.
- Reduced motion shows static composition with readable text.
- Video has poster fallback.
- Total initial hero payload has a defined budget.
- Product layers stay crisp at target sizes.
- No burned-in text.
- No giant veil/shawl/scarf/ghost-cloth motif.

## Required Correction

Produce the asset kit first. Do not let implementation agents build the hero from reference images directly.

