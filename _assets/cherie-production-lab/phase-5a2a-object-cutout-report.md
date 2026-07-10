# Phase 5A.2a — Object Cutout Pipeline Report

Date: 2026-07-10 · Tooling: ImageMagick 7 (already installed via Homebrew) — corner/edge flood-fill background removal + targeted color keys + connected-components alpha cleanup. No AI, no new dependencies, no integration.

## Method (final pipeline)
1. Eight-seed flood-fill (`-fill none`, corners + edge midpoints) at per-object fuzz — removes connected background while protecting ivory content *inside* objects (essential for the ivory-on-ivory invitation).
2. Where needed: targeted global color keys for enclosed background pockets, and pre-crop (seal).
3. Connected-components alpha rebuild (area-threshold) to kill speckles/halo fragments; for objects with legitimate interior holes the CC mask is **multiplied** with the keyed alpha (CC alone re-fills holes — discovered and fixed during pass 3/4).
4. Edge decontamination: 1px alpha erode + 0.5px alpha blur (no white halos on dark grounds).
5. `-trim` + 24px transparent padding (via `-extent`; note: `-bordercolor none -border` after channel-A ops triggers an ImageMagick bilevel-flattening quirk — avoided) + resize longest side ≤1024.
6. Delivery: PNG-32 alpha master + WebP alpha (q90, alpha-q95).

## Sources → outputs

| Object | Source (`04-maison-objects/`) | Fuzz/keys | Output | Dims | PNG / WebP |
|---|---|---|---|---|---|
| Invitation | D1-invitation-envelope-v2.png | 3.5% flood, CC 6000 | `public/home/hero/cutouts/object-invitation.{png,webp}` | 1024×1001 | 1.19 MB / 143 KB |
| Wax seal | D2-wax-seal.png | 80% pre-crop, 10% flood, CC 300000 (largest-blob) | `public/home/hero/cutouts/object-seal.{png,webp}` | 929×1024 | 1.00 MB / 99 KB |
| Candle | D9-candle.png | 8% flood, CC 8000 | `public/home/hero/cutouts/object-candle.{png,webp}` | 740×1024 | 320 KB / 43 KB |
| Ribbon/brass | D3-silk-ribbon-brass.png | 8% flood + 5 pale keys + hole-preserving CC | `_work/cutouts/draft-object-ribbon--paper-backing-remnant.png` (DRAFT) | 760×1024 | draft |
| Gift box | D4-gift-box.png | 11% flood + 3 targeted seed floods, CC 15000 | `_work/cutouts/draft-object-gift--glow-bg-fused.png` (DRAFT) | 1024×896 | draft |

Contact sheets (ivory `#FAF7F1`, mid-grey `#808080`, dark burgundy `#2A0E14`): `_assets/cherie-production-lab/_work/cutouts/contact-sheet-{ivory,grey,dark}.png`.

## QA notes (every result visually inspected on all three grounds)

**PASS — object-invitation** ✅ Card + envelope + burgundy liner read perfectly; deckled/scalloped edges preserved; no white halo on dark, no dark halo on ivory; no glyphs (v2 source is the blank-embossed regeneration). Minor: two small edge nibbles at the envelope's lower-left where liner shadow matched the background tone — visible only at 200%; flagged as an optional polish item, not blocking.

**PASS — object-seal** ✅ Clean burgundy disc, monogram + laurel relief intact, poured-wax edge preserved. The floating brass-plate fragment from the source's corner was eliminated by the largest-component pass. Subtle light rim on the lower-left edge (source rim light, not a matte halo).

**PASS — object-candle** ✅ Clean silhouette: pillar, flame, wick, brass chamberstick, ribbon bow. The soft atmospheric glow around the flame is necessarily lost to the cutout — intentional: the WebGL stage re-adds glow (additive halo already exists in `MaisonObjects`). No jaggies, no halos.

**NEEDS MANUAL RETOUCH — ribbon (draft only, not shipped)** ⚠️ The pale element behind the silk twist is **ivory tissue paper that is part of the still-life arrangement**, not background — it interpenetrates the silk edges, so color keys either leave it or start eating the silk's feathered edges. A pure-silk cutout requires manual masking (Photoshop pen/refine-edge). The current draft is usable as a "silk on paper scrap" vignette if that reading is ever wanted, but it fails the strict no-background-remnant rule.

**NEEDS MANUAL RETOUCH — gift (draft only, not shipped)** ⚠️ The lid-glow blends object and background inseparably at pixel level: remnant lit-background bands and a lattice-textured patch survive next to the box, and any key strong enough to remove them eats the cream box faces. This one genuinely needs hand masking. Recommendation: consider whether the gift plane is even required for Phase 5C — the procedural gift placeholder may survive until a Blender GLB replaces it anyway (per layer spec, gift's end-state is GLB).

**Reference-only recommendation:** none of the five need demotion to reference-only; ribbon and gift are retouch-queue items, the other three are production-ready.

## Budgets
All WebP deliveries 43–143 KB (≤300 KB budget ✅). PNG masters 0.3–1.2 MB — masters ship in `public/` for now as lossless fallback; runtime should reference the WebP files.

## Status
Not committed. Nothing integrated — HeroOverture/HeroStage/WebGL/app untouched. Bride/groom/hands cutouts (5A.2b) not started.

---

## Corrective pass (2026-07-10, post visual gate)

**object-candle — REPAIRED ✅ (regenerated PNG+WebP in public/).** Root cause of the pale collar: six enclosed background pockets inside/behind the bow loops, opaque in the flood layer itself; located by grid-probing for opaque background-colored pixels, cleared with targeted interior flood seeds at (1260,1320), (660–1260, 1370), then rebuilt with the hole-preserving multiplied mask. Top-edge fringe softened with Erode 1.5 + blur 0.8 — flame, wick, drips, brass, bow all intact. Green-screen verified: loops now show through.

**object-invitation — IMPROVED but NOT FIXED ⚠️.** Three approaches attempted: (1) 2.5% flood union — partial restoration; (2) solid-silhouette interior hole-fill — no effect because the bite connects to outer background; (3) 1.5% flood union — background patches survive attached to the object (worse). Conclusion: at any fuzz that preserves the flap's shadow-toned edge, background remains; at any fuzz that clears background, the flap erodes. **CLI ceiling reached — needs manual masking.**

---

## FINAL STATUS after owner visual-gate ruling (2026-07-10)

**Gate FAILED for invitation and candle** — auto-mask edge damage is not acceptable for CHERIE DAY production quality. Cleanup executed:
- `public/home/hero/cutouts/` now contains **object-seal.{png,webp} only** (A, runtime candidate).
- Failed invitation/candle drafts archived in `_work/cutouts/failed-auto-mask/`.
- Ribbon: manual-only / procedural reference. Gift: Blender reference only.

**Standing rule adopted:** CLI/flood-fill auto-masking = rough drafts only, never final, for delicate painterly objects. Final runtime cutouts require manual pen-masking (Photoshop/Affinity) or a substantially higher-quality matte, then re-gate at ≥560px on ivory/dark/green. Full ruling in [phase-5a2a-object-visual-gate.md](phase-5a2a-object-visual-gate.md).
