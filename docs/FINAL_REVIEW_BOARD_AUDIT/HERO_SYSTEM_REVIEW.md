# Hero System Review

## Verdict

**Concept readiness: strong. Implementation readiness: conditional.**

`03_HERO_CINEMATIC_SYSTEM.md` is one of the strongest files in the package. It correctly rejects a flat AI-video hero and defines a layered, DOM-based, scroll-controlled hero with GSAP ScrollTrigger, Lenis, real Turkish HTML copy, responsive layer rules, reduced-motion fallback, accessibility, and performance requirements.

The hero is buildable as a technical specification. It is not build-ready as an asset package.

## Architecture Review

Confirmed correct:

- Background video is ambience only.
- Foreground objects are independent DOM layers.
- GSAP ScrollTrigger controls the pinned timeline.
- Lenis controls smooth scroll.
- Turkish text is real HTML/CSS.
- Brand marks, QR, wax seal, and logo are locked.
- Flat AI video hero is explicitly forbidden.
- Giant veil/shawl/ghost cloth is explicitly forbidden.
- Reduced-motion fallback is specified.
- Mobile simplification is specified.
- Performance constraints are named.

## Strengths

- The scroll stages communicate the CHERIE DAY business model: Maison, paper, digital, keepsakes, atmosphere, CTA.
- The layer stack is clear enough for a GSAP engineer.
- The responsive sizing guidance is practical.
- The text system is accessible and brand-appropriate.
- The acceptance criteria prevent the worst failure mode: a pretty video with no interactive structure.

## Blocking Gaps

### Missing Production Layers

The repo does not contain final transparent layer files. It contains reference images:

- invitation-card-reference.png
- envelope-wax-seal-reference.png
- burgundy-ribbon-reference.png
- champagne-ribbon-reference.png
- qr-card-reference.png
- ring-box-reference.png
- seal.png
- still-life-wax-seal-cherry-ribbon.png

These are not named, optimized, separated production layers.

### Background Video Not Finalized

The repo contains `assets/hero-source/wedding-garden-background-source.mp4`, but the manifest requires final target files:

- `hero/wedding-background-loop.mp4`
- `hero/wedding-background-loop.webm`
- `hero/wedding-background-poster.jpg`

No WebM or poster exists.

### Source Paths Are Non-Portable

The hero spec still references `/Users/albarayousef/Downloads/...` brand/video files instead of the repository-local `assets` files.

### No Frame-By-Frame Acceptance Fixture

The hero spec defines progress stages, but no visual acceptance references exist for 0%, 30%, 45%, 60%, 75%, and 100% states. This creates interpretation risk for art direction.

## Required Hero Fixes

- Produce final transparent foreground assets.
- Create poster and WebM fallback.
- Replace all non-repo asset paths.
- Create a simple art-direction board for the six timeline states.
- Define exact final layer filenames and dimensions.
- Verify QR card remains crisp after transform.
- Verify logo and stamp SVG usage in the invitation/seal context.
- Add mobile hero acceptance criteria with screenshot targets.
- Define failure fallback if video autoplay is blocked.

## Final Hero Judgment

The hero system is strategically and technically sound. Do not simplify it into a flat video. Do not build it until the actual layer kit exists.
