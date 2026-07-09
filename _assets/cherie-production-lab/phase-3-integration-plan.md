# Phase 3 — Homepage Hero Integration Plan (PLAN ONLY, not implemented)

Date: 2026-07-08 · Basis: Phase 2C.2 accepted as blocking milestone.
Constraint recap: WebGL stays abstract/blocking; no generated assets in code; F1-4K poster swap deferred until approved; homepage untouched until this plan is approved.

## 1. Files

**Create**
- `components/home/hero/HeroStage.client.tsx` — promotion of `HeroLabStage` into the shared engine. Props: `runwayVh` (lab 400 / homepage 300), `hud` (lab true / homepage false), `debug` (?p= override; lab always, homepage dev-builds only), `overlayVarTarget` (writes `--hero-progress` CSS var for the DOM text choreography).
- `components/home/hero/HeroWebGL.tsx` — 10-line client island: `dynamic(() => import(...HeroStage), { ssr:false })` + a module-level `HERO_WEBGL_ENABLED = true` kill-switch constant.

**Modify**
- `components/home/sections/HeroOverture.tsx` — becomes the runway host: outer `StageFrame` grows to `h-[300vh]`, everything current moves into an inner `sticky top-0 h-screen` frame; `<HeroWebGL />` slots between the background strata and the text container; text container gets `style={{ opacity: 'var(--hero-text-opacity)' }}` driven by progress. All Phase 2A CSS/SVG layers stay — they ARE the poster.
- `components/home/hero/HeroLabStage.client.tsx` — shrinks to a thin wrapper: `<HeroStage runwayVh={400} hud debug />`. Lab behavior unchanged.

**Untouched (reused as-is)**
- Entire `components/home/hero/scene/` (all 10 files), `WebGLGuard.tsx`, `useScrollProgress.ts`, `lib/home/webgl-capability.ts`, `HeroPoster.tsx` (stays lab-only), `app/(lab)/hero-lab/page.tsx`.

**`app/(site)/page.tsx` — ZERO changes.** `HeroOverture` keeps its name and export; the island lives inside it. This is deliberate: rollback = one file.

## 2. Integration architecture
- Homepage stays a server component tree; `HeroOverture` remains SSR — full headline/CTA/semantics in initial HTML (SEO/LCP unchanged).
- WebGL enters only through `HeroWebGL` (client, `ssr:false`, returns `null` on server and until guard passes — no hydration surface).
- Headline, sub, CTAs remain real DOM in the sticky frame, layered ABOVE the canvas (`z-10`; canvas `absolute inset-0 z-0`, `aria-hidden`). No text ever rendered inside the canvas.
- Text choreography (CSS-var only, no re-renders): visible at p<0.15, fades out 0.15→0.3 while the promise plays, returns at p≥0.92 with the CTAs (Duruş = conversion moment).
- Canvas is background/stage only; pointer events pass through (`pointer-events-none` on the canvas wrapper; parallax reads window pointer as in the lab).

## 3. Fallback strategy (chain, first hit wins)
1. SSR / JS off → Phase 2A poster (current CSS/SVG art) + full text. Always the LCP.
2. `prefers-reduced-motion` → poster only, no canvas, no pin-scrub surprises (runway can collapse to 100svh via media query).
3. Viewport <1024px (all mobile/tablet) → poster only this phase.
4. `deviceMemory < 4` or no WebGL2 → poster only.
5. Session crash flag (`cherie-webgl-failed` via StageErrorBoundary) → poster for the rest of the session.
6. All pass → canvas mounts over the poster background, under the text.

**F1/G2 later (Phase 5A, approval-gated):** poster imagery upgrade only — `<picture>` in HeroOverture: ≥1024px F1-derived 16:9 (2560w AVIF/WebP from the 4K master), <1024px G2 9:16; `priority` preload as LCP. No structural change — the fallback chain above already terminates in "poster".

## 4. Performance plan
- three/r3f/postprocessing stay in the dynamic `ssr:false` chunk — never in the homepage First-Load JS. Budget check: `next build` homepage route must stay ≈106 kB First Load (current baseline); the hero chunk (~300 kB gz three stack) loads lazily and only after guard approval.
- Mount lifecycle: IntersectionObserver (rootMargin 150%) + guard, unmount when scrolled far past — identical to lab.
- DPR clamp stays `[1, 1.75]`; `powerPreference: 'high-performance'`; bloom multisampling 0.
- No WebGL on mobile (viewport gate). No ProductWorlds / Services / CTA-ribbon canvases in Phase 3 — their StageFrames stay CSS-only.
- Homepage `<400ms` TBT impact target: canvas mounts post-hydration, post-LCP by construction.

## 5. Visual strategy
- Ship the Phase 2C.2 abstract blocking exactly as accepted — presences as light auras (no crude humans), fan-stroke near-touch, procedural maison placeholders.
- F1 remains the locked composition contract (thirds, center ring, under-ring ribbon, object stations per hero-lab-layer-spec.md).
- No generated images in code, no Blender GLBs, no Theatre.js. Phase 5/6 swap assets/keyframes onto these same stations.

## 6. Debug / QA
- **?p= override:** KEEP. Lab: permanent. Homepage: enabled only when `process.env.NODE_ENV === 'development'` (compile-time dead-code-eliminated from production bundles — zero prod surface).
- Beat testing: dev `/​?p=0|0.35|0.6|0.85|1` on homepage + `/hero-lab?p=…` unchanged; screenshot each.
- Build gate: `npm run typecheck && npm run build`; compare homepage route size to the 106 kB baseline; confirm hero chunk is separate.
- Hydration: load `/` in dev with console open — zero hydration warnings expected (island renders null until mounted); verify SSR HTML contains full hero text (`curl | grep "Her şey bir dokunuşla"`).
- Mobile: 375×812 viewport → no `<canvas>`, poster + text visible, CTAs tappable. Reduced-motion emulation → same. Session kill-switch: set the flag manually, reload, confirm poster.

## 7. Rollback plan (fast → thorough)
1. **Instant disable:** flip `HERO_WEBGL_ENABLED = false` in `HeroWebGL.tsx` → homepage renders exactly Phase 2A (poster + text, no canvas, chunk never requested). One line.
2. **Full revert to 2A:** restore `HeroOverture.tsx` (single modified file), delete `HeroStage.client.tsx` + `HeroWebGL.tsx`, restore the 4-line `HeroLabStage` wrapper to its current form. `app/(site)/page.tsx` needs nothing — it was never touched.
3. Lab route is unaffected by rollback in either direction.

## 8. Stopping point — Phase 3 definition of done
Complete when: homepage hero scrubs the promise scene on eligible desktops; poster+text on mobile/reduced-motion/no-WebGL; typecheck+build green; homepage bundle within baseline; zero hydration warnings; rollback constant verified working.

**Approval screenshots before Phase 4 / 5A:**
1. Homepage desktop at p = 0, 0.35, 0.6, 0.85, 1 (five shots, dev override)
2. Homepage mobile 375px poster fallback
3. Homepage desktop reduced-motion poster fallback
4. `next build` route table (bundle proof)
5. `/hero-lab` p=0.85 (regression check — lab unchanged)

Open decisions needing your call before implementation:
- Runway length on homepage: 300vh proposed (lab is 400vh) — pacing choice.
- Text choreography windows (fade 0.15–0.3, return 0.92) — tune on first review.
