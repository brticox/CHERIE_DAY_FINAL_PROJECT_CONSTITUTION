# Hero-Lab Layer Specification — Phase 2C.2 (blocked against F1)

Art-direction target: `06-hero-poster-frames/F1-hero-full-nanobanana-4K.png` (reference only — not inserted).
Screen positions are approximate fractions of the frame (desktop 16:9); depth order is back (1) → front (10).
"Phase 5 replacement" states what supersedes each procedural placeholder.

| # | Layer / object | Role | Approx. screen position | Depth | Phase 5 replacement |
|---|---|---|---|---|---|
| 1 | Sky plane (`Backdrop`) | Ivory painted-paper sky | full frame | 1 (z −6) | WebGL texture plane ← E1-ivory-paper-sky (+ H1 grain) |
| 2 | Paper/brass/lace strata (`Backdrop`) | Painted stage depth + airborne warmth | full frame, drifting | 2 (z −4.8…−1.8) | WebGL texture planes ← E3 (right aura), E4 (brass haze); E2-left-half as veil stratum |
| 3 | Bride presence (`PresencePanels` left) | Gown/veil aura owning the **left third** | x ≈ 12–33%, y center, settles toward center-left | 3 (z −0.9…−0.46) | Generated cutout ← B1 full / B4-pattern soft-alpha veil separation (B-side) |
| 4 | Groom presence (`PresencePanels` right) | Suit column owning the **right third** | x ≈ 67–88%, y center, settles toward center-right | 3 (z −0.9…−0.46) | Generated cutout ← B4-groom-half-figure (primary) |
| 5 | Ribbon (`RibbonCurve`) | Red silk connecting the two sides, passing **under/behind** the ring at center | spans x ≈ 15→85%, dips to y ≈ 58% center | 4 (z −0.12…−0.08 center) | Stays procedural (WebGL geometry); material ← H2-burgundy-silk + D3 reference |
| 6 | Gesture strokes (`GestureStrokes`) | Near-touch fingers, abstract 3-stroke fan per side; lead tips rest ±0.17 from center (gap never closes) | converge on ring from x ≈ 30% / 70% | 5 (z −0.05…0.03) | Hybrid: C1/C3 as art target; strokes stay procedural or become C1-based texture plane |
| 7 | Ring (`RingTorus`) | The jewel — **exact center**, still point of the frame | x 50%, y ≈ 48% | 6 (z 0) | Blender GLB (brass band); material ← H4-brushed-brass |
| 8 | Invitation (`MaisonObjects`) | Born object — F1's sealed envelope | upper-left of ring (x ≈ 30%, y ≈ 28%) | 7 (z ≈ 0.18) | Blender GLB (or D1-v2 cutout plane) ← D1-invitation-envelope-v2 |
| 9 | Candle (`MaisonObjects`) | Born object — F1's chamberstick | upper-right of ring (x ≈ 67%, y ≈ 26%) | 7 (z ≈ 0.02) | Blender GLB ← D9-candle |
| 10 | Wax seal (`MaisonObjects`) | Born object — closes the letter | left of ring (x ≈ 26%, y ≈ 50%) | 7 (z ≈ 0.3) | Blender GLB (or D2 cutout plane) ← D2-wax-seal; relief ← H3 |
| 11 | Gift (`MaisonObjects`) | Born object — at the ribbon's end | right of ring (x ≈ 74%, y ≈ 44%) | 7 (z ≈ 0.22) | Blender GLB ← D4-gift-box |
| 12 | Söz/nişan tray (`MaisonObjects`) | Born object — grounds the constellation | lower-center (x ≈ 50%, y ≈ 78%) | 7 (z ≈ 0.15) | Blender GLB ← D5-tray (modeling reference only — not final pixels) |
| 13 | Particles | Single golden burst at the touch (0.55–0.8) | radiates from center | 8 | Stays procedural |
| 14 | Bloom + vignette (`Effects`) | Climax-scoped glow, frame hold | full frame | 9 (post) | Stays procedural; lighting target ← F2 |
| 15 | HeroPoster (DOM, under canvas) | LCP + no-WebGL fallback | full frame | 0 (DOM) | Poster fallback ← F1-4K (desktop) / G2 (mobile) |

Progress beats: 0 Giriş · 0.15–0.55 Yaklaşma · 0.6–0.72 Dokunuş · 0.6–0.9 Doğuş (births 0.60/0.63/0.67/0.70/0.73) · 0.92+ Duruş.
Debug: `/hero-lab?p=<0..1>` pins progress (lab-only; parsed in `HeroLabStage`, which only the lab route mounts).
