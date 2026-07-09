# CHERIE DAY — Visual Asset Curation Report

**Date:** 2026-07-07 · Sources: [production-lab-index.md](production-lab-index.md), [job-manifest.json](job-manifest.json)
**Status:** curation only — nothing integrated, homepage and /hero-lab untouched.

---

## 1. Best hero poster frame — **F1** (`06-hero-poster-frames/F1-hero-full-nanobanana.png` + 4K master)

**Why F1 wins:**
- It is the only frame that satisfies the *entire* hero contract in one image: bride left, groom right, near-touch at center, ring of light, red ribbon connecting, maison objects born from the light, ivory/burgundy/brass palette, no text.
- Light ivory field around the center means headline/CTA can be overlaid without fighting the image.
- It exists as a 4096×2294 4K master — the only frame (with F2) that survives a full-bleed desktop hero.

**Role assignment:**
- **F1 → art-direction target AND desktop poster fallback.** It is the compositional contract the WebGL scene must converge to, and until WebGL ships it is the static hero.
- **F2 → lighting/mood target + secondary poster.** The most emotional frame (silhouettes leaning over the ring, envelope born from light), but its painted gold frame border must be cropped, and the dark vignette limits text overlay. Use its light behavior (rim glow, additive ring) as the WebGL lighting reference.
- **F3-v2 → layer-source and wide-composition reference.** Figures are far apart on a clean ivory field — both figures are individually croppable, and it demonstrates the "ribbon spanning the void" reading at ultrawide.
- **F4 → detail/mood reference only.** Headless waist-crop, dark key; the ribbon-bound wrists idea is worth stealing, the frame itself is not a hero.

## 2. Hands/fingers ranking — C1 > C3 > C2 > C4

| Rank | File | Final-grade? | Risks / retouch |
|---|---|---|---|
| 1 | C1-creation-near-touch | **Yes — primary near-touch plate** | None found. Anatomy flawless, candlelit chiaroscuro matches A1 direction. |
| 2 | C3-light-thread-touch | **Yes — alternate plate / motion reference** | None on anatomy. The luminous thread is the literal storyboard for the WebGL light-thread effect. |
| 3 | C2-ring-between-fingertips | Usable | Finish is more photographic than painterly; light rays are baked in (harder to animate around). Good as ring-scale/placement reference. |
| 4 | C4-red-thread-promise | Usable with care | Groom hand pose slightly stiff; sparkle field is busy behind the bow. Best as red-thread motif reference, not final plate. |

All four passed the five-finger / no-distortion / no-plastic-nails check. **C1 and C3 are final-quality.** If credits return, upscale C1 to 4K.

## 3. Bride/groom references — B4 > B3 > B1 > B2

| Rank | File | 2.5D cutout viability | Separation work needed |
|---|---|---|---|
| 1 | B4-groom-half-figure | **Excellent** — flat ivory bg, modern burgundy tux, candle-on-palm | Simple background removal; hard edges throughout. |
| 2 | B3-groom-full-figure | Good — flat ivory bg, clean silhouette | Simple background removal; slight vintage coat length acceptable at layer scale. |
| 3 | B1-bride-full-figure | Good geometry, flawed content | Two passes: (a) retouch/paint out the pseudo-calligraphy glyph ribbons in the bouquet, (b) separate the semi-transparent veil as its own soft-alpha layer — a hard cutout will kill the veil edge. Already has a sticker-cutout border that helps matting. |
| 4 | B2-bride-half-figure | Technically croppable | **Do not use for final** — 1980s puff-sleeve styling violates the modern-luxury brief. Keep as painterly-skin/lighting reference only. |

**Background removal route:** do it locally (Photoshop select-subject or `rembg`) — Higgsfield balance (1.36 credits) should be preserved, and B1's veil needs manual alpha work no automatic tool will get right anyway. Output spec: transparent PNG cutouts + separate veil layer with soft alpha.

## 4. Background/stage layers — E4 > E1 > E3 > E5 > E2

**Proposed final layer stack (back → front):**

| Slot | Asset | Blend / prep |
|---|---|---|
| Background | **E1 ivory-paper-sky** | Base plate. Heal-brush the small horizon artifact first. |
| Atmosphere (side) | **E3 groom-shadow-aura** | Right-anchored, multiply/soft-light. Crop right edge (stray suit shoulder). Mirror-flip a desaturated copy at low opacity for the bride-side veil aura if needed. |
| Midground | B4 + B1/B3 cutouts (from §3) | Bride left, groom right, per F1 blocking. |
| Atmosphere (center) | **E4 candlelit-brass-haze** | Additive/screen above midground, masked to the center — this is the "ring of light" glow bed. |
| Foreground | **E5 floral-foreground** | Bottom border, slight blur + parallax offset. |
| Veil overlay | **E2 veil-aura (left half only)** | Screen/soft-light, masked; discard the right half (hard vertical seam). |

Gap: there is no dedicated *left-side* bride aura (E2 is fabric, not aura) — see §9.

## 5. Maison objects — ranking and roles

**Ranking:** D3 (silk+brass) > D2 (wax seal) > D9 (candle) > D1-v2 (invitation) > D8 (album) > D7 (QR card) > D4 (gift box) > D6-v2 (chocolate) > D5 (tray).

| Use | Assets | Notes |
|---|---|---|
| **Direct image plane** (2.5D floating objects around the ring of light) | D1-v2, D2, D3, D4, D9 | Clean isolates on plain ivory, trivial cutouts, consistent light direction. |
| **Texture reference** | D2 + H3 (wax), D3 + H2 (silk), D9 (brass patina in holder) | Feed the WebGL material pass. |
| **Blender modeling reference** | D5 (tray geometry — its photographic finish is actually *useful* here), D8 (album), D4 (box), D9 (candle + holder), D1-v2 (envelope fold) | Geometry/proportion reference, not final pixels. |
| **Retouch before plane use** | D6-v2 (faint pseudo-script on wrapper), D7 (two stray glyphs at left edge) | 5-minute clone-stamp jobs. |
| **Rejected only** | D1 v1 (gibberish calligraphy), D6 v1 (flame on chocolate) | Stay in 09-rejected. |

## 6. Best mobile fallback — **G2** (`07-mobile-fallbacks/G2-mobile-hands-close.png`)

Instantly readable at phone size: two hands, ring, red ribbon on ivory paper — nothing else. G1 (signature squiggle, candle-mirror ambiguity) and G3 (collage literalness) are B-choices.

**Crop/safe-area needs (source is 1152×2048, 9:16):**
- The ring sits at ~45% height, hands span the middle 60% — all key content is center-weighted, so cropping the sides for taller devices (19.5:9, 20:9) is safe.
- Top ~15% is quiet paper → safe for status bar / notch.
- Bottom ~20% (bride's sleeve corner) tolerates a CTA/scroll cue overlay; keep the ring un-occluded.
- No embedded text anywhere, so localized headlines can be typeset over it freely.
- If credits return: 4K upscale G2 before shipping it as the retina poster.

## 7. Texture references → WebGL materials

| Material | Primary | Secondary / notes |
|---|---|---|
| Paper | **H1** | E1 for large-scale paper-sky tone. Not verified tileable — needs a seamless pass (Photoshop offset or Substance) before use as a repeating map. |
| Silk | **H2** | D3 for how silk folds/catches light at object scale. |
| Wax | **H3** | Doubles as bump/displacement source (strong relief). D2 for seal color grade. |
| Brass | **H4** | Anisotropic brushed reference for the ring material; D9 holder for aged patina variant. |
| Veil | **H5** | Good for color/translucency; it is drape, not a tulle-mesh macro — insufficient for a weave normal map (see §9). E2 left half for in-scene veil behavior. |

## 8. Integration strategy (Phase 5 asset classes)

| Class | Assets |
|---|---|
| **Poster fallback** | F1-4K (desktop), G2 (mobile), F2-4K cropped (alternate/dark variant) |
| **2.5D cutout planes** | B4, B3, B1 (after ribbon retouch + veil separation); objects D1-v2, D2, D3, D4, D9; hands plate C1 (center detail layer), C3 (alternate) |
| **WebGL textures** | H1–H5 per §7 (H1/H4 after seamless pass; H3 as displacement) |
| **Blender modeling references** | D5, D8, D4, D9, D1-v2; F1 as scene-blocking reference; F2 as lighting reference |
| **Art-direction only (never rendered)** | A1, A2, A3, B2, C2, C4, F3-v2, F4, G1, G3 |
| **Rejected only** | 09-rejected/ trio (D1 v1, D6 v1, F3 v1) |

## 9. Missing assets / regeneration & repair list

**Repair (local, no credits needed):**
1. B1 — paint out glyph ribbons; separate veil to soft-alpha layer.
2. D6-v2 wrapper script, D7 edge glyphs, G1 signature squiggle — clone-stamp.
3. E1 horizon artifact — heal brush. E3 — crop right edge.
4. H1/H4 — make seamless/tileable versions.
5. Background-removal pass → transparent cutouts for B3/B4/B1 + 5 object planes.

**Still missing (generate when credits/subscription allow — none are blockers):**
6. Modern bride half-figure to replace B2 (current one is 80s-styled).
7. Left-side bride veil *aura* layer (E2 is literal fabric; the stack lacks a soft ivory aura mirroring E3).
8. True tulle-mesh macro texture (H5 replacement) if the veil shader needs a weave normal map.
9. Painterly (non-photographic) söz/nişan tray if D5 ends up on screen rather than in Blender.
10. 4K upscales of C1 and G2 (2 credits each; balance is 1.36 — currently impossible).

**Must not be used:** 09-rejected trio; B2 as final attire; D5 as final on-screen art; E2 right half.

## 10. Final recommendation — **continue Phase 2C procedural blocking first**

Reasoning:
- The sprint's real deliverable is that **F1 locks the composition**: positions, scale relationships, ring placement, ribbon path. Phase 2C blocking can now proceed against a fixed target instead of guesses — that makes blocking *more* valuable, not less.
- Phase 5A work (background removal, retouch, seamless textures, layer separation) is **offline work with zero credit/subscription dependency** — it loses nothing by waiting, and rushing it before blocking risks preparing layers at the wrong crops/resolutions.
- Blocking will *reveal* the true asset specs (exact plane sizes, which edges get parallax-exposed, whether the veil needs its own plane) — that spec should drive 5A, not the other way around.

**Concrete order:** finish 2C blocking with placeholder planes proportioned to F1 → freeze the layer spec → run 5A preparation (§9 repair list) against that spec → then integrate. If there is spare time during 2C, the only 5A tasks worth front-running are the pure-repair items (§9.1–4), since they're spec-independent.
