# LUXURY DESIGN REVOLUTION SYSTEM

This file defines the design school for CHERIE DAY after reviewing the UI UX Pro Max skill and adapting its principles to a Turkish luxury Wedding, Gift & Celebration Maison.

## 1. Design School

CHERIE DAY follows:

**Ceremonial Editorial Commerce**

This is a blend of:

- quiet luxury,
- editorial commerce,
- cinematic storytelling,
- tactile product design,
- Turkish premium emotional warmth,
- conversion psychology without pressure,
- advanced motion with restraint,
- accessible design-system discipline.

It is not:

- generic wedding decoration,
- Shopify template luxury,
- dark brutalist agency portfolio,
- neon/WebGL spectacle,
- Gielly Green copy,
- SaaS dashboard,
- marketplace/storefront clutter.

## 2. What We Learned From UI UX Pro Max

Use:

- token architecture: primitive -> semantic -> component,
- accessibility as non-negotiable,
- mobile-first interaction,
- Lenis smooth scrolling where appropriate,
- GSAP ScrollTrigger for meaningful storytelling,
- reduced-motion fallback,
- touch target discipline,
- performance budgets,
- clear forms and recovery paths,
- shadcn/Radix primitives for accessible dialogs, drawers, forms, accordions, and tabs,
- systematic component states,
- conversion-driven page structure.

Do not use literally:

- ultra-dark brutalist visual language as the main brand,
- neon accents,
- aggressive letter-spacing,
- excessive custom cursor behavior on commerce-critical screens,
- micro-audio by default,
- heavy WebGL shaders for product browsing,
- magnetic effects on every button,
- scroll-jacking that traps users.

## 3. CHERIE DAY Wow Principle

The wow must come from **taste, choreography, and emotional clarity**, not visual noise.

Correct wow:

- invitation card and wax seal drifting into focus as the Turkish headline appears,
- product material macro revealing paper, ribbon, seal, texture,
- drawer cart opening like a private selection tray,
- collection pages feeling like curated ceremony rooms,
- proof approval feeling calm and trustworthy,
- checkout feeling elegant and secure.

### MotionSites-Style Inspiration Boundary

The attached MotionSites-style reference is valuable for its **dream-portal landing composition**:

- central oversized editorial headline,
- layered atmospheric background,
- soft floating foreground forms,
- calm capsule navigation,
- immersive full-viewport entrance,
- CTA placed after mood has been established,
- motion that feels like entering an archive or world.

CHERIE DAY may adapt this logic, but not copy the exact visual language.

Use the principle:

- a central ceremonial title,
- a living atmospheric garden/video background,
- floating CHERIE DAY object layers,
- soft frame-like foreground depth,
- slow reveal into the Maison world.

Do not copy:

- the exact `Digital Archive` layout,
- cloud-heavy visual system,
- bird/wing motifs as the main identity,
- orange/blue dramatic sky palette,
- exact navigation shape/text,
- exact typography composition,
- the paid prompt or any proprietary generated prompt.

For CHERIE DAY, translate the idea into:

**The Opening Garden Gate**

- garden video instead of cloud painting,
- invitation/envelope/wax seal/ribbon layers instead of generic floating symbols,
- Turkish Maison headline instead of archive language,
- ivory/burgundy/brass warmth instead of orange/blue drama,
- product and service pathways instead of gallery/archive entry only.

### Dream-Portal Template Anatomy

This reference should be understood as a **visual system template**, not as content. The system is valuable because the whole first viewport behaves like one artwork instead of a stack of separate web sections.

#### Visual Composition

- Full-bleed illustrated/cinematic world fills the viewport.
- The center is reserved as a quiet reading chamber for the headline.
- The edges are visually denser and act as a natural frame.
- Foreground objects float at different depths around the headline.
- The top navigation is light, transparent, and integrated into the scene.
- Bottom utility links are small enough to feel like credits, not page clutter.
- The CTA is understated and centered after the headline, not oversized.

#### Depth System

The effect comes from layered depth:

1. far atmosphere: sky, garden, light, horizon, architecture,
2. mid atmosphere: mist, glow, soft particles, distant movement,
3. foreground frame: foliage, curtains, flowers, candles, ribbons,
4. living objects: birds in the reference; CHERIE DAY objects in our version,
5. typography plane: headline and CTA,
6. interface plane: header, account/cart/menu, small utility links.

For CHERIE DAY, replace the reference's birds/clouds with:

- invitation card,
- envelope,
- wax seal,
- silk ribbon,
- QR card,
- ring box,
- gift object,
- subtle petals or candle glints only where needed.

#### Motion Grammar

The motion must feel like one continuous scene:

- background moves slowly or scrubs with scroll,
- foreground objects drift at different speeds,
- objects enter from the edges toward the center but do not cover the headline,
- text appears with a calm line/word reveal,
- navigation remains almost still to preserve orientation,
- CTA appears after the mood is established,
- scroll continues the same visual language into the next section.

Avoid independent animations that look like separate widgets. Every motion should share the same timing family and atmospheric logic.

#### Typography Logic

The headline is the visual anchor:

- large editorial serif/sans contrast,
- high hierarchy,
- centered,
- generous line-height control,
- short Turkish phrase,
- no long paragraph in the hero center,
- supporting copy smaller and quiet.

For CHERIE DAY, the typography must stay readable in Turkish. Do not use aggressive negative tracking or extreme compression that harms Turkish diacritics.

#### Color And Light Logic

The reference uses dramatic atmospheric contrast. CHERIE DAY should translate that into:

- warm ivory light,
- burgundy depth,
- brass glints,
- paper and candle warmth,
- garden greens softened into the background,
- no orange/blue drama as the main palette,
- no cartoon cloud fantasy.

The color should feel like evening garden ceremony, not fantasy archive.

#### Scroll Continuity

The landing must not cut from one design style to another. The first scroll after the hero should feel like walking further into the same Maison.

Implementation rule:

- an object or motif from the hero should visually hand off into the next section,
- the same light direction continues,
- the same motion easing continues,
- section boundaries are softened through overlap, not hard block jumps,
- the first post-hero section should inherit one material: ribbon, paper, seal, or garden light.

#### CHERIE DAY Adaptation Name

Use this internal pattern name:

**Living Maison Canvas**

Definition: a full-page visual system where background, typography, motion, objects, and navigation belong to one cinematic composition. It is not a landing-page hero pasted above normal sections; it is an art-directed entrance into the CHERIE DAY world.

#### Implementation Pattern

Use:

- one full-viewport `HeroCanvas` section,
- `position: absolute` layered DOM objects,
- `z-index` depth scale,
- CSS variables for layer positions,
- GSAP timeline for scroll-scrub,
- Lenis for smooth scroll,
- reduced-motion static frame,
- pointer-safe nav and CTA layer,
- mobile layer reduction.

Do not use:

- a single flattened video with all content burned in,
- random animated stickers,
- separate animations per object without shared choreography,
- inaccessible text inside images,
- scroll trap longer than the emotional payoff,
- heavy WebGL for MVP.

### Sensory Commerce Template Anatomy

The second attached reference is valuable for its **sensory commerce composition**:

- split first viewport with human/emotional imagery on one side and product/nature proof on the other,
- large plain-language headline,
- small rounded CTA,
- very clean product carousel below,
- tab-like category switcher,
- product cards with heavy whitespace,
- full-bleed vertical category tiles with oversized rotated/vertical labels,
- a calm cream/paper store background,
- editorial beauty without making shopping difficult.

CHERIE DAY may adapt this as:

**Sensory Maison Commerce**

Use the principle:

- emotion + product proof in the same viewport,
- cinematic opening followed by immediate shop clarity,
- products shown with generous whitespace,
- category panels that feel like visual doors,
- minimal text on cards,
- drawer cart/inquiry behavior.

Do not copy:

- the beauty brand's exact layout,
- product imagery, labels, category names, or visual assets,
- exact typography/spacing,
- exact split hero crop,
- exact product carousel treatment.

For CHERIE DAY, translate it into:

- left: emotional ceremony detail, couple moment, hands, fabric, invitation moment,
- right: product/material proof such as invitation, wax seal, ribbon, QR card, gift box,
- headline: short Turkish Maison promise,
- carousel: `Öne Çıkan Seçimler`,
- tabs: `Çok Sevilenler`, `Davetiye`, `Hediyelik`, `Dijital`, `Setler`,
- category tiles: `davetiye`, `hediyelik`, `dijital`, `hatıra`, `planlama`,
- CTA: `Seçimleri Gör`, `Teklif İste`, or `Hayalini Tasarla`.

#### Sensory Commerce Scroll

This pattern is best used after the cinematic hero or on `Mağaza`:

1. cinematic hero opens the Maison world,
2. sensory split section grounds the emotion in product/service proof,
3. product carousel gives immediate shopping clarity,
4. vertical category tiles create visual exploration,
5. drawer cart/inquiry keeps the user in the same world.

#### Product Carousel Rules

- use large cream whitespace,
- show 4-5 items desktop, 1.2-1.6 items mobile,
- product image is the hero of the card,
- show name, category, price/quote status, production/proof tag,
- no star ratings,
- no discount badges,
- no crowded filters in first view,
- horizontal drag/snap is allowed if accessible.

#### Vertical Category Tile Rules

- full-bleed image tiles may be used as visual doors,
- labels can be large/vertical only if readable,
- each tile must include one small CTA,
- mobile stacks tiles with readable horizontal labels if vertical labels become awkward,
- images must show real CHERIE DAY product/service states, not generic stock.

#### Psychological Role

The dream-portal reference creates wonder. The sensory-commerce reference creates trust and shopping orientation. CHERIE DAY needs both:

`Wonder -> Proof -> Desire -> Choice`

This prevents the site from becoming only beautiful without commercial clarity.

Wrong wow:

- too many particles,
- gold everywhere,
- bouncing buttons,
- endless parallax,
- giant typography that harms Turkish readability,
- WebGL distortion over product images where customers need to inspect details,
- cursor effects that interfere with buying.

## 4. Page-Level Design Direction

### Homepage

Structure:

1. cinematic hero,
2. short Maison positioning,
3. six clear entry doors: `Deneyimler`, `Koleksiyonlar`, `Mağaza`, `Dijital`, `Hatıra`, `Planlama`,
4. featured collection,
5. tactile product house preview,
6. digital/memory/planning teasers,
7. trust/process section,
8. Rehber preview,
9. final calm CTA.

The homepage must feel like entering a house, not scrolling through marketing blocks.

### Hero

Hero style:

- background video ambience,
- DOM product layers,
- real Turkish HTML text,
- quiet pinned scroll timeline,
- one primary CTA,
- one secondary CTA,
- reduced-motion static composition,
- mobile simplified.

Hero composition can borrow the MotionSites reference's **central portal discipline**:

- centered headline in the calmest visual area,
- atmospheric edges framing the middle,
- floating layers entering from edges, never covering the CTA,
- top navigation feels like a refined capsule or transparent Maison bar,
- bottom utility links are small and quiet if used.

CHERIE DAY hero must still remain materially specific:

- card, envelope, wax seal, ribbon, QR card, ring box, gift object,
- no abstract decorative objects unless they support the ceremony/product story.

Motion rhythm:

- intro: soft reveal,
- layer choreography: slow material focus,
- text: word/line reveal, not every letter on long Turkish text,
- CTA: appears only after emotional context is readable.

### Product House / Shop

The shop must feel curated:

- generous product rows,
- tactile images,
- clear filters without marketplace noise,
- no star-rating marketplace pattern,
- no discount-first merchandising,
- product cards show material, production time, proof requirement, price/quote status.

Product detail hierarchy:

1. imagery,
2. product name,
3. collection/category,
4. price or `Teklif ile`,
5. production time,
6. personalization,
7. proof approval,
8. CTA,
9. story/material,
10. delivery/returns,
11. related set.

### Checkout

Checkout is luxury through clarity:

- one-column mobile,
- calm progress,
- no visual clutter,
- clear Turkish labels,
- legal acceptance near final payment,
- payment recovery path,
- WhatsApp fallback,
- no poetic ambiguity in legal/payment text.

### Account / Order / Proof

These screens should feel like a private atelier:

- quiet status timeline,
- proof preview large and legible,
- revision action clear,
- support access visible,
- no dashboard-like analytics clutter.

## 5. Motion Library Decision

Use:

- **Lenis** for smooth scroll on public storytelling pages.
- **GSAP ScrollTrigger** for homepage hero and selected editorial reveals.
- **Framer Motion** only for small UI transitions if already included.
- **CSS transitions** for buttons, hover, focus, cards.
- **Radix/shadcn primitives** for accessible drawer/dialog/accordion behavior.
- **CSS 3D transforms** (`perspective`, `translate3d`, `rotateX/Y/Z`, `scale`) for lightweight depth before considering WebGL.

Avoid:

- heavy WebGL in MVP,
- micro-audio by default in MVP,
- custom cursor on mobile and checkout,
- magnetic effects on legal/payment/checkout screens,
- scroll effects on forms.

Three-dimensional feeling should be achieved first through layered DOM, perspective, and scroll-scrubbed transforms. Three.js/WebGL is future-only unless a specific interaction cannot be achieved with DOM/CSS/GSAP.

### Optional Tactile Audio: Silk String Dividers

The Burocratik-style vibrating audio divider is approved only as an **optional, opt-in tactile detail**, adapted to CHERIE DAY as:

**Silk String Dividers**

Concept:

- thin divider lines behave like delicate silk/wire strings,
- hovering/sweeping across them can produce a subtle visual wave,
- if sound is enabled by the user, the wave may be driven by Web Audio API/analyser data,
- the sound palette should be soft: harp, glass, silk string, distant music box, not guitar-rock or loud synth.

Where allowed:

- homepage between cinematic/editorial sections,
- collection pages,
- memory/film pages,
- special Maison storytelling surfaces.

Where forbidden:

- checkout,
- account,
- login/register,
- legal pages,
- payment states,
- support forms,
- any mobile-critical flow unless it is visual-only and non-disruptive.

Implementation rules:

- audio is off by default,
- user must explicitly enable sound,
- visible sound toggle required if audio exists,
- visual wave must work without audio,
- no essential information depends on sound,
- respect reduced motion and browser autoplay restrictions,
- canvas divider hit area must be larger than the visible 1px line,
- CPU use must remain low,
- stop animation loop when divider is offscreen where possible.

Fallback:

- if audio is disabled, use a mathematical spring wave on canvas or SVG,
- if reduced motion is enabled, render a static fine line.

This effect should feel like touching a ribbon or string inside the Maison, not like a tech demo.

### Optional Cursor And Marquee Rules

Custom cursor:

- allowed only on desktop storytelling/gallery surfaces,
- forbidden on mobile, checkout, account, legal, and forms,
- must never hide the native cursor where precision matters,
- may show small labels like `İncele`, `Oynat`, `Sürükle` only where helpful.

Endless marquee:

- allowed for soft editorial ribbons such as collection names, material words, or press-like trust notes,
- must be slow,
- must pause/reduce for reduced motion,
- cannot carry essential content alone,
- should not appear on checkout/account/legal flows.

## 6. Interaction System

### Desktop

Allowed:

- subtle magnetic feel on hero CTA only,
- inertial hover on collection/product images,
- smooth drawer opening,
- image scale 1.02-1.04,
- line reveal for headings,
- pinned hero only.

### Mobile

Allowed:

- tap feedback within 100ms,
- drawer slide,
- simple fade/translate reveals,
- static or reduced hero.

Not allowed:

- hover-only interactions,
- precision tapping,
- horizontal scroll that conflicts with page scroll,
- pinned scroll that traps the user.

## 7. Psychological Selling System

Every commercial page must answer:

1. What is this?
2. Why is it beautiful?
3. Why is it trustworthy?
4. What can I personalize?
5. How long does it take?
6. What happens after I inquire/pay?
7. What is the next calm action?

Conversion levers:

- material specificity,
- production timeline,
- proof approval,
- Turkish support,
- secure Turkey-only payment,
- matching collection products,
- soft WhatsApp fallback,
- no pressure language.

## 8. Component Wow Patterns

### Opening Garden Gate

The hero can behave like a CHERIE DAY version of an animated archive entrance:

- background garden video scrubs with scroll,
- central headline appears in two refined lines,
- if the video already contains invitation/card/seal/ribbon/QR/ring/gift objects, do not duplicate those same objects as hero overlays,
- use object overlays only when the video lacks a specific CHERIE DAY signal or when a small brand mark is needed,
- CTA appears once the scene is emotionally legible,
- scroll end hands off to Maison intro or featured collection.

The goal is not to say "look at the animation"; it is to make the visitor feel they have entered a curated celebration house.

### Cinematic Scroll Film Hero

If the hero video already contains the invitation card, wax seal, burgundy ribbon, QR card, ring box, gift box, and other CHERIE DAY-like objects, the primary hero pattern becomes:

**Cinematic Scroll Film Hero**

Rules:

- the video is the hero's main artwork,
- scroll controls video time,
- the video opens/reveals more as the user moves downward,
- no duplicate object layers are placed over the same objects already present inside the video,
- HTML Turkish headline, CTA, header, and accessibility text remain real DOM,
- a soft readability gradient/vignette is allowed,
- reduced motion uses a selected poster frame,
- mobile uses shorter/simpler playback or poster-first behavior.

This is not weaker than the layered-object approach. It is more cinematic and safer for MVP if the video composition already contains the necessary CHERIE DAY objects.

### What To Do With Separate Object Images

The separate images become **continuity motifs**, not redundant hero decoration.

Use them below the hero to make the whole site feel like one magical artwork:

- invitation card becomes the visual bridge into `Mağaza` and product house,
- wax seal becomes section divider, proof approval symbol, and trust mark,
- burgundy ribbon becomes a scrolling thread between sections,
- QR card becomes the entrance into `Dijital`,
- ring box becomes a cue for engagement/wedding experiences,
- gift box becomes the cue for gifts/favors,
- envelope becomes the entry into invitations and personalized stationery,
- still-life image becomes product/collection editorial framing.

Implementation rule:

- the hero video reveals the world,
- the separate object images carry pieces of that world into the sections below,
- each object should reappear where it has commercial meaning,
- no object should be decorative-only.

### One-Piece Magical Scroll

The homepage must avoid hard visual cuts after the hero. The first 3-5 sections should feel like a single continuous scroll composition.

Recommended scroll handoff:

1. Hero video reaches its final reveal.
2. A burgundy ribbon or paper edge continues downward from the hero into the Maison intro.
3. The invitation card motif becomes the first product/collection preview.
4. The wax seal becomes a small trust/process marker.
5. The QR card appears naturally in the Digital section.
6. The gift/ring object leads into products or experiences.

This creates continuity:

`garden film -> Maison promise -> collection world -> product house -> digital/gift pathways`

The user should feel they are walking deeper into CHERIE DAY, not leaving one section and entering a different website.

### Continuous Chapter Scroll Plan

The animated reference proves that the strongest experience is not a single beautiful hero, but a connected chapter system where visual motifs continue between sections.

CHERIE DAY homepage should follow this chapter flow:

#### Chapter 1 - Opening Garden Gate

Role: cinematic wonder.

- full-screen scroll-scrub video,
- central Turkish Maison headline,
- transparent/header chrome,
- CTA appears after visual reveal,
- no hard bottom edge.

Handoff device:

- garden light, paper edge, ribbon trace, or seal glow continues downward.

#### Chapter 2 - Maison Promise

Role: emotional clarity.

- background shifts from video to deep burgundy/ivory atmosphere,
- one short Turkish promise,
- a small seal/ribbon/paper motif enters from the hero edge,
- motion slows so the user can understand.

Handoff device:

- motif becomes divider or section anchor.

#### Chapter 3 - Worlds / Collections

Role: desire through aesthetic self-selection.

- collections reveal like rooms or worlds,
- each card/room inherits light and material from the hero,
- no generic grid entrance,
- hover/tap reveals matching products and services.

Handoff device:

- chosen material or palette carries into product house.

#### Chapter 4 - Product House

Role: commercial clarity.

- cream/paper store background,
- product carousel or curated product rows,
- large whitespace,
- `Seçimlerim` drawer behavior,
- products feel like objects from the world already introduced.

Handoff device:

- invitation/box/ribbon object leads into category tiles.

#### Chapter 5 - Digital / Memory Bridge

Role: modern surprise and emotional proof.

- QR/digital motif transforms from physical card to digital experience,
- memory/film uses slower cinematic stills,
- no SaaS dashboard look.

Handoff device:

- light trail or paper edge leads into planning.

#### Chapter 6 - Hayalini Tasarla

Role: personalization and conversion.

- guided flow appears like a private consultation,
- one question at a time,
- calm progress,
- WhatsApp fallback.

Handoff device:

- final CTA returns to Maison identity.

#### Chapter 7 - Rehber / Footer

Role: authority and trust.

- motion becomes minimal,
- reading takes priority,
- footer uses burgundy/ivory calm,
- legal/payment/contact trust signals appear clearly.

### Connected Section Rules

- Every section must inherit one visual motif from the previous section.
- Every section introduces only one new major visual idea.
- Background transitions should blend through color, material, or object continuity.
- Avoid abrupt white-to-dark jumps unless they are framed as a chapter change.
- Use overlapping edges, ribbons, paper sheets, or soft masks to connect sections.
- Keep the centered Maison header as orientation anchor.
- Use GSAP timelines only for chapter handoffs and key reveals, not every item.

### Homepage Continuity Acceptance Test

The homepage fails if a reviewer can describe it as:

- "a nice hero followed by normal sections,"
- "separate templates stacked together,"
- "beautiful but disconnected,"
- "too animated to understand,"
- "a store pasted under an art piece."

The homepage passes if it feels like:

- one cinematic Maison journey,
- every section belongs to the same world,
- beauty becomes product clarity,
- motion leads to understanding,
- the user always knows what to do next.

## 11. Cinematic Scroll Psychology System

The whole site should be choreographed like a luxury short film with commercial purpose. The user must feel curiosity, orientation, desire, trust, and action in sequence. Motion is used to sustain attention without exhausting the visitor.

### Attention Rhythm

Use a repeating rhythm:

1. **Wonder** - reveal an atmospheric or tactile moment.
2. **Anchor** - give a clear headline or product/service meaning.
3. **Proof** - show material, process, collection, product, or trust cue.
4. **Choice** - offer one calm next action.
5. **Breath** - let the user rest before the next cinematic moment.

Never stack cinematic moments without a breath. Luxury needs silence between reveals.

### Section Choreography

#### Hero - Opening Wonder

- Scroll scrubs the video.
- Headline appears only when the visual center is readable.
- CTA appears after the scene is understood.
- No overlaid duplicate objects if the video already contains them.

Psychological role: wonder and brand memory.

#### Maison Intro - Emotional Anchor

- The motion slows.
- A ribbon/paper/seal motif carries from the hero.
- Copy is short, warm, and clarifying.

Psychological role: "I understand what this Maison does."

#### Collections - Desire Through Worlds

- Collection cards/rooms reveal one at a time, not all at once.
- Palette chips or material words drift in subtly.
- Hover/tap reveals matching products, not decorative text.

Psychological role: desire and self-identification.

#### Product House - Conversion Clarity

- Product images enter calmly with reserved layout space.
- No heavy parallax on product grids.
- Micro-motion highlights material, proof requirement, production time, and CTA.

Psychological role: "I can choose or inquire without confusion."

#### Digital - Modern Surprise

- QR card or digital preview motif transitions from physical paper into digital screen/phone-like frame.
- Motion should feel like a gentle transformation, not SaaS dashboard animation.

Psychological role: "This Maison is traditional and modern."

#### Memory - Emotional Proof

- Use slower cinematic fades and still frames.
- Let images breathe.
- No fast carousel.

Psychological role: trust, memory, and emotional depth.

#### Planning - Personalization

- Multi-step flow appears as calm guided conversation.
- Each step reveals only one question.
- Progress feels like unfolding, not form-filling.

Psychological role: "They can understand my dream."

#### Rehber - Helpful Authority

- Motion becomes quieter.
- Reading experience takes priority.
- Internal links feel editorial, not salesy.

Psychological role: confidence and search trust.

#### Checkout / Account / Proof - Calm Control

- Motion becomes functional only.
- No cinematic scroll effects.
- Use status timelines, drawer transitions, inline feedback.

Psychological role: trust, safety, completion.

### Anti-Boredom System

The user does not get bored when each section changes the emotional job while keeping the same visual world.

Use variation through:

- scale: full-bleed -> intimate detail -> grid -> drawer,
- tempo: slow reveal -> calm reading -> focused action,
- material: garden light -> paper -> wax -> ribbon -> digital glow,
- interaction: scroll -> hover/tap -> drawer -> form,
- copy: poetic headline -> concrete proof -> clear CTA.

Do not use variation through random colors, unrelated layouts, or new design styles.

### Cinematic Continuity Devices

Use recurring devices:

- ribbon as path,
- wax seal as trust,
- paper edge as section handoff,
- candle/glint as subtle motion accent,
- QR motif as digital bridge,
- garden light as atmospheric continuity,
- centered Maison header as orientation anchor.

Each recurring device must change role across the page. Example:

- ribbon in hero = motion and romance,
- ribbon in collections = visual divider,
- ribbon in product = packaging/material proof,
- ribbon in checkout = tiny brand accent only.

### Scroll Pacing Rules

- One pinned cinematic hero only.
- Other sections use normal scroll with subtle reveal.
- Avoid long scroll hijacking.
- Use `ScrollTrigger` for moments, not every element.
- No section should require waiting for animation before reading essential text.
- Mobile should reduce pacing complexity by at least 40%.

### Boredom Prevention Checklist

Each section must have:

- one new emotional reason to continue,
- one clear visual novelty,
- one concrete piece of product/service information,
- one calm CTA or pathway,
- one continuity motif from earlier sections.

If a section has motion but no new meaning, remove the motion.

### Maison Header

- centered logo,
- left menu,
- right account/cart,
- sticky blur after scroll,
- small height,
- no crowded nav.
- use the `CHERIE Maison Chrome` pattern from `21_GIELLY_GREEN_INSPIRATION_SYSTEM.md`,
- borrow the restraint of Gielly-style header rhythm: centered mark, left discovery, right utilities,
- keep it lighter than the hero; it should orient, not compete.

Header states:

- over hero: transparent or softly tinted, hairline border, readable logo,
- after scroll: ivory/paper blur with charcoal text,
- over burgundy sections: cream text or inverted mark,
- drawer open: body scroll locked, focus trapped, escape closes drawer.

Menu visual language:

- burgundy or ivory full-height drawer,
- oversized but elegant Turkish labels,
- small serif section headings,
- hairline separators,
- one featured visual/action panel,
- no dense list of every route in equal weight.

### Selection Drawer

Cart drawer should feel like `Seçimlerim`, not a generic cart:

- product image,
- personalization summary,
- proof note,
- production time,
- checkout/inquiry action,
- support link.

### Collection Room

Collection page should feel like a styled room:

- palette chips,
- material words,
- hero image,
- matching products,
- matching digital theme,
- matching experience.

### Proof Approval

Proof approval should feel ceremonial and calm:

- large preview,
- `Onaylıyorum` primary,
- `Düzeltme İstiyorum` secondary,
- revision note field,
- clear production-start message.

## 9. Design System Architecture

Build tokens in three layers:

1. primitive tokens: raw color/space/type values,
2. semantic tokens: surface, text, accent, danger, success, focus,
3. component tokens: button, drawer, card, input, header, hero.

No raw hex values inside components after foundation.

## 10. Acceptance Standard

The design is approved only if:

- first viewport immediately says CHERIE DAY visually and emotionally,
- Turkish copy is readable and elegant,
- no section feels like a generic template,
- mobile is calmer than desktop, not a broken smaller desktop,
- checkout is trustworthy before it is beautiful,
- every animation has a reason,
- every product can be understood quickly,
- no page feels like a marketplace,
- accessibility is preserved,
- performance budgets are respected.
