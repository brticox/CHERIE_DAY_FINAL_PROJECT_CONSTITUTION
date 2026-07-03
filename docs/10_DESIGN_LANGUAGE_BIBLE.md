# CHERIE DAY Design Language Bible

This is the final, buildable visual language for CHERIE DAY. It resolves and consolidates `design-psychology.md`, `luxury-brand-analysis.md`, `motion-bible.md`, and `component-bible.md` into concrete, implementable rules.

Upgrade layer: apply `CHERIE_DAY_REVOLUTION_BLUEPRINT.md` for section-level design decisions. Visual design must support a connected cinematic Maison system, not isolated decorative pages.

## Brand Feeling

CHERIE DAY should feel like a **celebration maison**: calm, warm, curated, emotionally intelligent, Turkish-global. Every screen should pass this test — *does this feel like one accountable house with taste, or a directory with options?* If it feels like a directory, it's wrong.

Five words to design against: **calm, warm, curated, tactile, accountable.**

---

## Color System

Structure: a warm neutral base, one deep anchor color, one warm accent, and collection-specific palettes layered on top for Collection pages only (never on core brand pages).

**Core palette (brand-level):**
- `--cherie-ivory` — The breathing room, replacing stark white with paper-like warmth.
- `--cherie-paper` — A textured, tactile background shade.
- `--cherie-burgundy` — The signature deep, romantic anchor.
- `--cherie-cherry` — The accent red, vibrant but luxurious.
- `--cherie-velvet` — A rich, deep tone for soft materials and premium packaging.
- `--cherie-brass` — The metallic accent, used for keys, typography accents, and hardware.
- `--cherie-ink` — primary text color, softer than black.
- `--cherie-lace` — A delicate overlay or border color.

**Rules:**
- No more than 2 accent colors visible in any single viewport.
- Brass/metallic accent is used for emphasis only — CTA text/border, active states, small dividers — never as a large fill.
- Collection palettes (from `collections.palette`) apply only within that Collection's own pages/cards. They must never override global header/footer/CTA colors.
- Text contrast must meet WCAG AA at minimum on every background combination used.

---

## Core Motifs & Patterns

**Motifs:** wax seal, cherry, key, ribbon, velvet, lace, paper texture, brass detail, framed panels.

**Layout patterns:**
- centered logo header
- large serif hero
- italic emphasis
- accordion expertise
- featured work/product grid
- masonry inspiration wall
- burgundy/ivory framed editorial panels

## Typography

**Structure:** one serif or refined display face for headlines (emotional register), one clean humanist sans for body/UI (functional register).

- **Display/Headline face:** an elegant serif with warmth (not a cold editorial serif) — used for H1/H2, hero statements, collection names.
- **Body/UI face:** a humanist sans with excellent Turkish character support (ğ, ş, ı, ö, ü, ç must render cleanly at all weights) — used for body copy, nav, buttons, forms.

**Scale (desktop → mobile):**
- H1: 56–64px → 32–36px
- H2: 40–44px → 26–28px
- H3: 28–32px → 20–22px
- Body: 17–18px → 16px (never below 16px for body text)
- Small/meta: 14px

**Rules:**
- Line length: 60–75 characters for Turkish body copy (Turkish words run longer than English — do not reuse English line-length assumptions).
- Line height: 1.5–1.6 for body, 1.15–1.25 for headlines.
- Letter-spacing: slightly open (+1–2%) on all-caps labels/eyebrows only; never on body copy.
- Weight usage: max 3 weights per page (e.g. Regular, Medium, Semibold). Avoid Bold+Black stacking.

---

## Spacing

Base unit: **8px**. All spacing values are multiples of 8 (8/16/24/32/48/64/96/128).

- Emotional sections (hero, collection intros, portfolio, testimonials): generous — 96–160px vertical section padding on desktop, 48–64px on mobile.
- Operational sections (forms, FAQ, admin, product grids): tighter — 48–64px desktop, 32px mobile.
- Card internal padding: 24–32px desktop, 16–20px mobile.
- Never let more than one CTA compete inside a single 8px-spacing "zone" — one dominant action per section, per `design-psychology.md`.

---

## Imagery & Photography Direction

**General rule:** the first viewport of any page must show a real, specific image (product detail, event moment, couple, material) — never abstract stock or generic wedding cliché imagery.

**Photography direction by context:**

| Context | Direction |
|---|---|
| Hero / brand | Cinematic, warm-toned, natural light, wide or medium shot — sense of a real moment, not a posed stock photo. |
| Collection | Flat-lay or styled tablescape shots showing palette + material together; consistent light temperature across a collection's set. |
| Product | Clean, tactile, macro-leaning shots on a neutral or collection-toned background; show texture (paper weight, wax, ribbon, print detail). |
| Portfolio | Documentary-style real-event coverage; consistent color grade across the portfolio grid so it reads as one house's work, not mixed sources. |
| Rehber/editorial | Helpful, illustrative, warmer and softer than portfolio — supports reading, doesn't compete with it. |
| Memory (film/photo) | Cinematic stills/thumbnails with letterboxed or wide-aspect treatment to signal "film," distinct from product photography. |

**Avoid:** generic stock couples, dark unreadable overlays, mixed color grades in one grid, overly cropped product shots that hide what the product actually is.

**Alt text:** every image requires descriptive alt text (SEO + accessibility) authored at CMS entry, not left blank.

---

## Iconography

- Use a single icon set throughout (line-weight consistent with typography weight — thin-to-regular strokes, not bold/filled icons).
- Icons are supportive, never decorative-only in critical UI (form fields, status, nav). Every icon paired with a text label in navigation and forms.
- Avoid playful/rounded icon styles — keep icon geometry restrained and slightly elongated to match the serif's elegance.

---

## Buttons

**Primary CTA:**
- Solid fill using `--cherie-ink` or `--cherie-deep`, text in `--cherie-paper`.
- On hover: subtle darken/lighten (5–8%), no scale-jump.
- Border-radius: small-to-moderate (4–8px) — sharp enough to feel tailored, not a pill/rounded SaaS button.

**Secondary CTA:**
- Outline or text-only with `--cherie-brass` underline/border accent.
- Hover: underline animates or border fills subtly (120–180ms).

**Rules:**
- Never more than one primary-style button visible per section.
- Button copy is always a verb phrase in Turkish (`Teklif Al`, `Hayalini Tasarla`) — never generic "Submit" or "Click Here."
- Disabled/loading states dim to ~40% opacity with a small inline spinner, never a full-page blocking spinner for simple form submits.

---

## Cards

- Stable aspect ratio per card type (no layout shift on image load — reserve space).
- Image occupies 60–75% of card height; text block below, generous padding (24px+).
- Hover (desktop only): image scale 1.02–1.04, border/shadow softens in, per `motion-bible.md`. No hover-triggered content reflow.
- Card shadow: soft, low-opacity, warm-toned (not cold gray) — e.g. `0 8px 24px rgba(28,24,21,0.08)`.
- Mobile: no hover state; tap simply navigates.

---

## Forms

- One question focus per visual grouping; multi-step forms (Hayalini Tasarla, Quote Request) show a slim progress indicator, not a percentage bar that feels transactional.
- Input fields: generous height (min 48px tap target), warm-neutral border, `--cherie-brass` focus ring (not a harsh blue default).
- Labels always visible above the field (never placeholder-only labels — accessibility and clarity).
- Validation: inline, warm-toned error color, message appears directly below the field, not as a top-of-page alert dump.
- WhatsApp fallback button always visible near primary form CTA on mobile.

---

## Empty States

- Empty states (e.g. no portfolio items yet in a filtered view, no FAQ in a category) use a calm, brand-voiced message — never a bare "No results found."
- Example tone: "Bu koleksiyon için yeni parçalar hazırlanıyor. Bu arada diğer dünyalarımıza göz atabilirsiniz." + a CTA back to a populated section.
- Include a single supportive visual (soft icon or muted illustration), not a jarring 404-style graphic.

---

## Success / Error / Loading States

**Success (form submit):**
- Full-section replace (not a modal popup) with a warm confirmation message, next-step guidance (e.g. "Ekibimiz 24 saat içinde dönüş yapacaktır"), and a WhatsApp fallback.
- Subtle fade + slight scale-in (per motion bible), no confetti/playful animation — luxury register stays calm even in celebration moments.

**Error (form/system):**
- Inline, specific, actionable ("Telefon numarası eksik görünüyor" not "Error 400").
- Never expose raw system/DB errors to the public UI.

**Loading:**
- Skeleton placeholders matching final layout shape (cards, hero) rather than spinners, wherever content is loading in-place.
- Simple inline spinner only for short-duration actions (button submit).

---

## Motion Personality

(Consolidating `motion-bible.md` into brand-level rules.)

- Motion is **clarifying, not decorative.** Every animation should communicate state change or hierarchy, never exist purely for delight.
- Timing: 120–180ms for controls, 300ms for cards, 500–700ms for hero/scroll reveals — always eased with `cubic-bezier(0.22, 1, 0.36, 1)`, never bounce/spring on brand pages.
- Scroll reveals grouped/staggered (60–100ms stagger), never element-by-element confetti-style reveal.
- Respect `prefers-reduced-motion` everywhere — this is a hard requirement, not optional polish.

---

## Texture, Glass, Shadow

- **Texture:** a very subtle warm grain/noise overlay (2–4% opacity) may be used on large hero/deep-color sections to avoid flat digital coldness — must never reduce text legibility.
- **Glass/blur:** permitted only for sticky header background-blur on scroll, and only subtly (8–12px blur, low opacity tint). Do not use heavy frosted-glass panels as a general design motif — it reads as generic SaaS, not maison.
- **Shadow:** always soft, warm-toned, low-opacity (see Cards section). Never sharp drop-shadows or cold gray shadows.

---

## Luxury Do / Don't

**Do:**
- Let whitespace do the talking around hero, collections, portfolio, testimonials.
- Repeat the same 1–2 primary CTAs consistently across the site rather than inventing new button copy per page.
- Keep every public claim about "who made this" resolve to CHERIE DAY-owned language.
- Use restraint: fewer, stronger claims per section rather than dense feature lists.
- Maintain one consistent color grade/mood across any single grid (portfolio, product, gallery).

**Don't:**
- Don't use marketplace visual patterns: rating stars per item, comparison tables between "vendors," saved/favorite-heart icons implying multiple sellers.
- Don't use discount/urgency badges ("Sale", "Limited Time", countdown-to-price-drop) — this breaks luxury trust.
- Don't stack more than one accent color plus brass in a single section.
- Don't let motion, texture, or glass effects ever slow down or obscure the primary CTA.
- Don't allow Collection palettes to bleed into global chrome (header/footer/CTA colors stay brand-core).
