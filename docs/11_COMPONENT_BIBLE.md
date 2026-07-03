# Component Bible

This component plan defines reusable UI pieces for the CHERIE DAY rebuild. Components should support a luxury Brand House, not a marketplace. Public data should be CHERIE DAY-owned; internal supplier/team records must not become public profiles.

Upgrade layer: `CHERIE_DAY_REVOLUTION_BLUEPRINT.md` defines the required elevated component system, including MaisonHeader, MaisonDrawer, CreativeOpening, CollectionWorldCard, MaisonProductCard, HayaliniTasarlaFlow, SeçimlerimDrawer, and admin operating components.

## CHERIE DAY Specific Visual Components

- Centered Maison Header
- Editorial Opening Statement
- Italic Emphasis Text
- Expertise Accordion
- Featured Work Grid
- Maison Product Grid
- Inspiration Masonry Wall
- Framed Editorial Panel
- Wax Seal Divider
- Collection Mood Board
- Product Object Card
- Packaging Showcase
- Door Hanger Preview
- Digital Invitation Phone Mockup
- Proof Approval Block
- Ribbon CTA
- Cherry Motif Marker

## Header

Purpose:
Orient users and express brand confidence.

Props/data needed:
Logo, nav groups, CTA label, CTA href, locale selector, optional WhatsApp link.

Desktop behavior:
Horizontal navigation with restrained dropdowns. Sticky on scroll only if it remains quiet and compact.

Mobile behavior:
Logo, menu trigger, quote/contact action. Hide dense navigation behind mobile menu.

Motion behavior:
Subtle background blur or border on scroll. No flashy animation.

CHERIE DAY-specific adaptation:
Primary nav: Maison, Deneyimler, Koleksiyonlar, Mağaza, Dijital, Hatıra, Planlama, Rehber, İletişim/Teklif Al. Utility actions: `Hesabım`, `Seçimlerim`, WhatsApp.

## Mobile Menu

Purpose:
Expose full IA on small screens.

Props/data needed:
Grouped nav items, CTA items, contact links, social links, locale.

Desktop behavior:
Not used.

Mobile behavior:
Full-height panel or drawer with grouped sections and a fixed bottom CTA.

Motion behavior:
Slide/fade with 180-240ms duration. Lock body scroll.

CHERIE DAY-specific adaptation:
Use Brand House groups, not search-first navigation.

## Mega Menu

Purpose:
Show rich category depth without overwhelming the header.

Props/data needed:
Groups, featured collection, featured article, CTA.

Desktop behavior:
Open on click or intentional hover. Use columns for Experiences, Product House, Digital, Planning.

Mobile behavior:
Collapse into accordions inside mobile menu.

Motion behavior:
Fade and slight y-transition.

CHERIE DAY-specific adaptation:
Use for `CHERIE DAY Dünyaları` and `Mağaza / Maison Ürünleri`; avoid provider/category search language.

## Hero

Purpose:
Make the page promise immediate.

Props/data needed:
Eyebrow, title, subtitle, primary CTA, secondary CTA, media, optional trust line.

Desktop behavior:
Full-width visual or refined editorial layout; text should remain readable.

Mobile behavior:
Stack media and text or use safe overlay with sufficient contrast.

Motion behavior:
Slow image fade/scale on load; text stagger no more than 120ms.

CHERIE DAY-specific adaptation:
Use one emotional statement and one clear next action.

## Section Header

Purpose:
Introduce a section and frame user expectation.

Props/data needed:
Eyebrow, heading, body, optional action.

Desktop behavior:
Left-aligned for operational sections, centered for editorial/luxury moments.

Mobile behavior:
Short line lengths; action moves below copy.

Motion behavior:
Optional scroll reveal.

CHERIE DAY-specific adaptation:
Use warm Turkish phrasing and avoid utility-only labels.

## Experience Cards

Purpose:
Represent CHERIE DAY-owned celebration types.

Props/data needed:
Title, slug, image, short description, included modules, collection references, CTA.

Desktop behavior:
2-4 column grid with strong image hierarchy.

Mobile behavior:
Single column or horizontal snap only if images remain large.

Motion behavior:
Image scale on hover, card elevation or border change.

CHERIE DAY-specific adaptation:
Cards say what CHERIE DAY creates; they do not list providers.

## Collection Cards

Purpose:
Present aesthetic worlds.

Props/data needed:
Name, slug, hero image, palette, mood words, included product categories, CTA.

Desktop behavior:
Large editorial cards; allow featured collection spans.

Mobile behavior:
One card per row with palette chips.

Motion behavior:
Soft image reveal and palette chip fade.

CHERIE DAY-specific adaptation:
Show a collection as a complete world across event, products, and digital.

## Product Cards

Purpose:
Support browsing in Product House.

Props/data needed:
Name, category, collection, image, price band or inquiry-only flag, material, personalization, production time.

Desktop behavior:
Grid with filter/sort side or top bar.

Mobile behavior:
2-column grid for small products if readable; otherwise one column.

Motion behavior:
Hover image swap or gentle zoom.

CHERIE DAY-specific adaptation:
Use `Sepete Ekle`, `Kişiselleştir`, `Ürünü İncele`, or `Ürün Hakkında Sor`, not “add vendor” or comparison actions.

## Customer Auth Forms

Purpose:
Support account registration, login, password recovery, and magic-link recovery in clear Turkish.

Props/data needed:
Email, password, name, phone, KVKK consent, marketing consent, return URL, error state, loading state.

Desktop behavior:
Centered, calm form with trust/support copy and no visual clutter.

Mobile behavior:
Full-width fields, 44px+ touch targets, correct keyboard types, visible labels, autofill support.

Motion behavior:
Minimal state transitions; no playful animation around authentication.

CHERIE DAY-specific adaptation:
Use `Giriş Yap`, `Üye Ol`, `Şifremi Unuttum`, `Hesabıma Dön`, and warm recovery copy. Do not use English auth labels.

## Account Dashboard

Purpose:
Give customers a complete, elegant place to review profile, orders, addresses, proof approvals, and support messages.

Props/data needed:
Customer profile, recent orders, saved addresses, support threads, proof approvals, recommended next action.

Desktop behavior:
Quiet account layout with clear sections, not a SaaS analytics dashboard.

Mobile behavior:
List-first, large tap rows, sticky access to `Siparişlerim` and `Destek`.

Motion behavior:
Functional fades/expands only.

CHERIE DAY-specific adaptation:
Use `Hesabım`, `Siparişlerim`, `Adreslerim`, `Tasarım Onaylarım`, `Destek Taleplerim`.

## Seçimlerim Drawer

Purpose:
Let users review selected products, personalization, quantities, production timing, and checkout readiness.

Props/data needed:
Cart items, product snapshots, variant/options, quantity, personalization summary, proof requirement, subtotal, delivery estimate, primary checkout CTA.

Desktop behavior:
Drawer or dedicated page; drawer can support quick review, page supports full edit.

Mobile behavior:
Dedicated cart page or full-height drawer; never cramped.

Motion behavior:
Slide/fade 220-300ms, body scroll locked while drawer is open.

CHERIE DAY-specific adaptation:
Use `Seçimlerim`, `Siparişe Devam Et`, `Koleksiyonunu Tamamla`, `Bu parçayı çıkar`. Avoid aggressive upsells.

## Güvenli Ödeme Flow

Purpose:
Complete Turkey-only purchase with confidence and clarity.

Props/data needed:
Customer identity, delivery address, billing address, shipping method, payment method, order summary, KVKK consent, distance sales consent, proof requirement summary.

Desktop behavior:
Two-column checkout: steps on left, calm order summary on right.

Mobile behavior:
One step per screen or compact vertical stepper; summary expandable.

Motion behavior:
Step transitions should be quick and stable. Never block interaction with decorative animation.

CHERIE DAY-specific adaptation:
Steps: `Giriş`, `Teslimat`, `Fatura`, `Ödeme`, `Onay`. Use `Güvenli Ödeme`, `Sipariş Özeti`, `Üretim ve Teslimat`. Turkey-only address fields are required.

Quality rules:
- Visible labels, never placeholder-only.
- Correct input types: email, tel, numeric, postal code.
- `autocomplete` enabled for email, name, phone, address, card-safe provider fields where applicable.
- Inline validation below each field.
- Button loading and success/error feedback.
- Clear retry path for failed payment.
- 44px minimum touch targets.

## Payment State Views

Purpose:
Explain payment status and next steps in reassuring Turkish.

Props/data needed:
Order number, payment provider, amount, status, retry/payment link, support CTA.

States:
`Ödeme Bekleniyor`, `Ödeme Alındı`, `Ödeme Başarısız`, `Ödeme İptal Edildi`, `İade Sürecinde`, `Kısmi İade`.

CHERIE DAY-specific adaptation:
Copy must be precise but warm. Example: `Ödemeniz alındı. Şimdi tasarım ve hazırlık sürecini sizin için özenle başlatıyoruz.`

## Order Tracking

Purpose:
Let customers follow order, proof, production, packaging, and delivery status.

Props/data needed:
Order number, items, payment status, proof status, production status, shipment status, tracking events, support CTA.

Desktop behavior:
Timeline plus order summary.

Mobile behavior:
Vertical stepper with large readable states.

Statuses:
`Ödeme Bekleniyor`, `Ödeme Alındı`, `Tasarım Sürecinde`, `Tasarım Onayı Bekleniyor`, `Üretimde`, `Kalite Kontrol`, `Paketleniyor`, `Kargoya Verildi`, `Teslim Edildi`, `Tamamlandı`.

CHERIE DAY-specific adaptation:
Tracking should feel like atelier progress, not warehouse logistics.

## Proof Approval

Purpose:
Allow customers to approve or request revisions for personalized products.

Props/data needed:
Proof media, version number, order item, approval CTA, revision comment, status, approval timestamp.

Desktop behavior:
Large proof preview, status and action panel beside it.

Mobile behavior:
Preview first, action panel below.

CHERIE DAY-specific adaptation:
Use `Tasarımı Onayla`, `Küçük Bir Revizyon İste`, `Onayınızdan sonra üretim süreci başlayacaktır.`

## Support Thread

Purpose:
Support product, order, payment, proof, and delivery inquiries from account and order pages.

Props/data needed:
Subject, related order/product, messages, attachments, status, staff replies.

Desktop behavior:
Inbox-like detail view without SaaS clutter.

Mobile behavior:
Chat-like thread with clear attachment and reply controls.

CHERIE DAY-specific adaptation:
Use `Destek Talebi`, `Sipariş Hakkında Sor`, `Ürün Hakkında Sor`, `Mesajınız CHERIE DAY ekibine ulaştı.`

## Gallery Grid

Purpose:
Show portfolio, products, memory, and collections visually.

Props/data needed:
Images, alt text, category, caption, linked story/product.

Desktop behavior:
Masonry or editorial grid with stable aspect ratios.

Mobile behavior:
Single or 2-column grid depending on image detail.

Motion behavior:
Lazy reveal; lightbox fade.

CHERIE DAY-specific adaptation:
Gallery is proof of CHERIE DAY’s aesthetic consistency.

## Story Cards

Purpose:
Represent portfolio/client stories and Rehber articles.

Props/data needed:
Title, excerpt, image, category, date/location, tags, CTA.

Desktop behavior:
3-column card grid or featured story layout.

Mobile behavior:
Single-column cards.

Motion behavior:
Subtle hover and image scale.

CHERIE DAY-specific adaptation:
Use `CHERIE DAY story` framing: world, mood, process, outcome.

## Testimonial Blocks

Purpose:
Build brand-level trust.

Props/data needed:
Quote, client name or initials, event type, location, collection, optional image.

Desktop behavior:
Large quote with supporting context; carousel only if needed.

Mobile behavior:
Single quote per viewport.

Motion behavior:
Fade between testimonials; no fast autoplay.

CHERIE DAY-specific adaptation:
Testimonials prove CHERIE DAY’s end-to-end care, not provider ratings.

## FAQ Accordion

Purpose:
Answer objections without clutter.

Props/data needed:
Question, answer, category, schema flag.

Desktop behavior:
Grouped accordions with first item optionally open.

Mobile behavior:
Full-width tappable rows.

Motion behavior:
Height/opacity transition 180-220ms.

CHERIE DAY-specific adaptation:
Answers should use CHERIE DAY-owned language and clear process terms.

## Quote Form

Purpose:
Capture qualified leads.

Props/data needed:
Event type, date, location, guest count, needs, style, collection, budget band, contact, notes, file upload.

Desktop behavior:
Multi-step form with progress and summary.

Mobile behavior:
One question per screen or short grouped steps.

Motion behavior:
Step transitions slide/fade; preserve entered data.

CHERIE DAY-specific adaptation:
Feels like a consultation, not a marketplace request.

## Contact Form

Purpose:
Capture general inquiries.

Props/data needed:
Name, email, phone, message, inquiry type, consent.

Desktop behavior:
Compact form beside contact details.

Mobile behavior:
Stacked, large fields, WhatsApp fallback.

Motion behavior:
Clear success state and gentle validation.

CHERIE DAY-specific adaptation:
Offer `WhatsApp ile yaz`, `Planlama görüşmesi iste`, and email.

## Timeline

Purpose:
Show process and planning milestones.

Props/data needed:
Steps, dates/durations, status, description, CTA.

Desktop behavior:
Horizontal or vertical depending on content length.

Mobile behavior:
Vertical stepper.

Motion behavior:
Steps reveal on scroll; active step highlight.

CHERIE DAY-specific adaptation:
Use for CHERIE DAY process and event planning previews.

## Checklist Preview

Purpose:
Show immediate planning value.

Props/data needed:
Checklist title, event type, tasks, completion state, CTA.

Desktop behavior:
Preview card with 5-7 tasks and CTA.

Mobile behavior:
Compact checklist with large tappable rows.

Motion behavior:
Check animation should be subtle.

CHERIE DAY-specific adaptation:
Checklist leads into CHERIE DAY Planning Suite.

## Digital Invitation Preview

Purpose:
Demonstrate digital invitation value.

Props/data needed:
Theme, collection, couple/event names, date, location, RSVP link, QR.

Desktop behavior:
Phone mockup beside feature list.

Mobile behavior:
Preview first, details below.

Motion behavior:
Small preview transitions between states.

CHERIE DAY-specific adaptation:
Tie preview to collection aesthetics.

## Wedding Website Preview

Purpose:
Show how CHERIE DAY Digital becomes a complete guest experience.

Props/data needed:
Theme, hero, story, schedule, map, RSVP, gallery.

Desktop behavior:
Browser mockup or full-width preview.

Mobile behavior:
Phone-first preview because guests often visit on mobile.

Motion behavior:
Scroll-through preview or tab transitions.

CHERIE DAY-specific adaptation:
Call it a digital love story or CHERIE DAY wedding website theme.

## Footer

Purpose:
Close with navigation, trust, contact, and SEO paths.

Props/data needed:
Nav groups, contact, WhatsApp, social, legal, newsletter, locale.

Desktop behavior:
Multi-column.

Mobile behavior:
Accordion groups or stacked links.

Motion behavior:
Minimal.

CHERIE DAY-specific adaptation:
Footer groups mirror Brand House modules.

## Admin-Ready Data Components

Purpose:
Ensure public components map cleanly to CMS/admin data.

Props/data needed:
Entity ID, slug, status, locale, SEO fields, media, tags, relations, sort order.

Desktop behavior:
Not public UI; used in admin tables, forms, previews.

Mobile behavior:
Admin mobile support can be limited initially, but lead views should be usable.

Motion behavior:
Functional transitions only.

CHERIE DAY-specific adaptation:
Internal supplier/team modules are operational only. They never generate public profile pages.
