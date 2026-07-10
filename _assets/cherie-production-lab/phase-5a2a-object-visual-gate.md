# Phase 5A.2a — Object Visual Gate (luxury art-direction review)

Date: 2026-07-10 · Reviewed at 560px on ivory `#FAF7F1` and dark burgundy `#241014` (gate views), plus the three saved contact sheets. This gate re-judges the technically "passing" cutouts as a creative director. **The 300px alpha-QA verdicts were too generous — two of the three shipped objects are downgraded here.**

## Verdicts

### object-seal — **A (hero-grade)** ✅
**Taste:** deep burgundy wax with real pour texture and embossed laurel monogram — tactile, quiet, genuinely maison; the single most CHERIE DAY object in the set.
**Runtime:** allowed, at its intended plane scale (≤~300px on stage). Two caveats: (1) the right-edge specular streak reads as rim light at plane scale but slightly cut-out-ish at 2× — don't scale this plane up; (2) the monogram reads "AM" — plausible as an anonymous couple's initials, but a **brand-owned seal design should eventually replace it** (future Blender/H3-relief seal). Not blocking.
**Commit now:** yes — this file is commit-ready.

### object-invitation — **B (usable with retouch)** ⬇️ downgraded
**Taste:** the object design itself is right — blind-embossed scalloped card over a burgundy-lined envelope, elegant, no fake text. But at hero scale the matte damage is disqualifying: a ragged bite eats the envelope's lower-left flap and a jagged transparency hole sits between flap and card — on the dark ground it looks moth-eaten. "Minor edge nibbles" at 300px is torn paper at 560px.
**Runtime:** NOT allowed in current form. After a localized re-matte of the flap edge (source data is clean there — this is a matte fix, likely CLI-recoverable with a low-fuzz protected pass; else 10 minutes of hand masking), it should re-gate at A.
**Commit now:** no — hold until repaired.

### object-candle — **B (usable with retouch)** ⬇️ downgraded
**Taste:** the chamberstick + drips + burgundy bow is charming and brand-right. But the dark-ground view exposes opaque ivory background trapped inside and behind the bow loops — a pale "collar" blob that reads as an obvious cutout mistake — plus a crunchy white fringe at the candle top/flame edge. Invisible on the ivory stage, embarrassing over any darker mid-ground (burgundy aura, shadows).
**Runtime:** NOT allowed in current form. Fix is known and cheap: the hole-preserving multiplied-mask technique (already proven on the ribbon) will clear the bow-loop pockets; a softer top-edge decontamination handles the fringe.
**Commit now:** no — hold until repaired.

## Draft objects

### ribbon — **manually retouch (queued), do not reject**
The silk itself is the most luxurious material in the entire object set (curation ranked D3 #1). The ivory tissue backing is content interpenetrating the silk edges — beyond CLI, worth real Photoshop time. **Not urgent:** the WebGL ribbon remains procedural (RibbonCurve) through Phase 5, so nothing blocks. Until retouched: reference/material use only.

### gift — **delay for Blender, reference-only until then**
Glow-fused background makes hand-masking expensive, and the layer spec already sends the gift to a Blender GLB as its end state. Spending retouch hours on an interim plane is bad allocation. Keep D4 as modeling/lighting reference; the procedural gift placeholder holds the slot.

## Summary table

| Object | Gate | Runtime later? | Commit now? |
|---|---|---|---|
| object-seal | **A** | yes (plane scale; brand-seal note) | **yes** |
| object-invitation | **B** | after flap re-matte + re-gate | no |
| object-candle | **B** | after bow-pocket clear + re-gate | no |
| ribbon (draft) | retouch queue | after manual mask | no (draft stays in _work) |
| gift (draft) | defer to Blender | as GLB reference only | no (draft stays in _work) |

## Recommended next action (superseded — see re-gate below)
One corrective CLI pass on invitation (protected low-fuzz flap re-matte) and candle (multiplied-mask pocket clear + softer top edge), then re-run this gate on the two repaired files.

---

# RE-GATE after corrective pass (2026-07-10, reviewed at 560px ivory + dark + green-screen)

| Object | Before | After | Runtime-eligible? |
|---|---|---|---|
| object-seal | A | **A** (unchanged, untouched) | yes |
| object-candle | B | **A** — pale collar gone (green shows through both bow loops), top fringe now reads as natural wax texture; flame/bow/brass intact | yes, at plane scale |
| object-invitation | B | **B** — bite reduced but still visible on dark grounds; three CLI strategies exhausted (union floods at 2.5%/1.5%, solid-silhouette hole-fill); the damage zone is tonally identical to background and connected to it | **no — not until manually re-matted** |

**Are all three shipped objects runtime-eligible?** No — two of three (seal, candle). Invitation stays gated.

**Should any file be removed from public before commit?** Recommendation: **remove `object-invitation.png` + `object-invitation.webp` from `public/home/hero/cutouts/` before committing** (or accept committing them as documented-B with the gate note — owner's call). The public copies are the best CLI version, strictly better than the first cut, but they fail the luxury bar on dark grounds. Manual retouch (~10 min of hand masking on the flap edge) then re-gate.

Ribbon/gift verdicts unchanged: ribbon → manual retouch queue (high value); gift → defer to Blender, reference-only.

---

# FINAL OWNER RULING (2026-07-10) — gate FAILED for auto-masked cutouts

The re-gate verdicts above are overruled by owner review: the invitation and candle are visibly eaten by the automatic mask (torn paper areas; nibbled bow/ribbon edges exposed by dark/green comparison). This is rough CLI cutout work, not CHERIE DAY luxury production.

## Final classification
| Object | Verdict | Disposition |
|---|---|---|
| object-seal | **A — runtime candidate** | Only file remaining in `public/home/hero/cutouts/` (green-screen re-verified: solid pour edge; right-edge specular noted for optional polish in the manual pass) |
| object-invitation | **FAIL auto-mask — manual retouch required** | Removed from public; best CLI draft archived at `_work/cutouts/failed-auto-mask/failed-object-invitation--flap-eaten.png` |
| object-candle | **FAIL auto-mask — manual retouch required** | Removed from public; draft archived at `_work/cutouts/failed-auto-mask/failed-object-candle--edge-eaten.png` |
| ribbon | **Manual only / procedural reference** | Draft stays in `_work/cutouts/`; WebGL ribbon remains procedural |
| gift | **Blender reference only** | Draft stays in `_work/cutouts/` |

## STANDING RULE (adopted)
**CLI/flood-fill automatic masking is never final for delicate painterly objects.** Automatic masking may only produce rough drafts for placement/scale tests. Final runtime cutouts require manual Photoshop/Affinity pen-mask work or a substantially higher-quality matting process, followed by this visual gate at ≥560px on ivory, dark, and green grounds.
