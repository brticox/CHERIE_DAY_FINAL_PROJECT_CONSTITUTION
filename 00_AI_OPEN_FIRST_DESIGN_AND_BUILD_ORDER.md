# CHERIE DAY - AI Open First Design & Build Order

This is the first file any AI builder must open.
Do not start by browsing random documents.
Do not build a generic landing page.
Do not create a static hero.

Your job is to build CHERIE DAY as a cinematic Turkish luxury commerce maison.

## 1. The One-Sentence Product

CHERIE DAY is a Turkey-only luxury wedding, invitation, gift, digital memory, and celebration commerce maison with a cinematic scroll experience and a serious modern store/admin system.

If the result feels like a normal template, it failed.

## 2. The First Screen

The site opens as a cinematic ceremony, not a landing page.

Required first-screen composition:

- Full-viewport hero.
- Centered refined CHERIE DAY identity.
- Floating transparent top navigation with logo centered.
- The actual CHERIE DAY hero video is the main visual world.
- The video must be controlled by scroll progress.
- As the user scrolls, the video timeline advances and reveals the ceremony objects already inside the film:
  - invitation card,
  - wax seal,
  - burgundy ribbon,
  - QR card,
  - ring box,
  - gift box,
  - other visible keepsake/product details.

Rejected:

- Static wedding image with text.
- Dark overlay plus two buttons.
- Generic hero card.
- Gradient/orb decoration.
- Fake cinematic wording without cinematic mechanics.

## 3. The Scroll Story

The homepage must feel like one continuous artwork.

Order:

1. **Opening Ritual**  
   The video begins quietly. The brand appears with restrained elegance. User feels they are entering a private maison.

2. **Object Awakening**  
   Scroll moves the video and lets the visible objects become meaningful. Text appears as small editorial whispers, not heavy blocks.

3. **Invitation World**  
   The invitation card becomes the bridge into invitation products, custom proof approval, personalization, and premium papers.

4. **Seal & Ribbon World**  
   Wax seal and burgundy ribbon become a tactile product chapter. Use close-up product cards and refined micro-motion.

5. **QR & Digital Memory World**  
   QR card becomes the bridge into digital invitations, memory pages, video/photo links, and digital delivery.

6. **Ring Box & Gift World**  
   Ring box and gift box become the bridge into keepsakes, gift boxes, nikah sekeri, event stationery, and quote-based premium packages.

7. **Curated Store**  
   The store appears as a calm luxury commerce surface: filters, categories, product cards, quick view, custom options, proof requirements, delivery notes.

8. **Maison Assurance**  
   Explain trust through interface, not marketing noise: secure payment, Turkey-only delivery, design approval, production time, support, legal consent.

9. **Concierge / Inquiry**  
   For custom items and events, user can request consultation, upload details, and continue later from account.

10. **Footer As Legal Maison Desk**  
   Legal links, KVKK, distance sales, returns, privacy, cookies, contact, support, social, payment marks.

## 4. Visual School

The design school is:

**Cinematic Ceremonial Editorial Commerce.**

It combines:

- MotionSites dream-portal depth,
- luxury beauty editorial restraint,
- modern Turkish ecommerce clarity,
- tactile wedding materiality,
- warm poetic Turkish copy,
- precise checkout/admin pragmatism.

The site should feel expensive, calm, magical, and easy.

## 5. Color & Material Direction

Use the CHERIE palette as a luxury base:

- deep burgundy,
- ivory,
- warm paper,
- brass/gold,
- cherry accent,
- soft ink,
- lace/mist neutrals.

But do not make the whole site one flat burgundy/beige theme.
Use contrast, photography, video, paper texture, metallic details, and white space.

## 6. Typography

Use a refined editorial serif for brand/headlines and a clean modern sans for commerce/UI.

Turkish copy must be elegant, literary, warm, and sometimes poetic.
All customer-facing public UI must be Turkish.

Avoid machine-like Turkish.
Avoid cold corporate copy.

## 7. Store Structure

The public store must include:

- home commerce highlights,
- collection pages,
- category pages,
- product listing,
- product detail,
- quick view,
- cart drawer,
- checkout,
- account,
- login/register,
- order tracking,
- proof approval,
- support/inquiry,
- legal consent checkpoints.

Core categories:

- Davetiye,
- Dijital Davetiye,
- Hediyelik & Nikah Sekeri,
- Wax Seal & Ribbon,
- Kutu & Packaging,
- Masa Karti & Event Stationery,
- QR Kart,
- Hatira & Album,
- Planlama / Ozel Teklif.

Product behavior types:

- normal cart product,
- proof-required custom product,
- digital delivery product,
- quote-required service,
- inquiry-only premium item.

## 8. Checkout And Payment

Service and commerce are Turkey-only.

Payment planning must support:

- domestic Turkish cards,
- international Visa/Mastercard/AMEX where enabled,
- TROY where available,
- iyzico,
- PayTR.

Checkout must include:

- account or guest flow,
- Turkish address,
- delivery method,
- invoice details,
- proof/customization details where needed,
- payment provider selection,
- KVKK consent,
- Mesafeli Satis Sozlesmesi consent,
- On Bilgilendirme Formu consent,
- order confirmation,
- payment status page.

## 9. Admin Structure

The admin must be treated as a real operating system, not an afterthought.

Admin modules:

- dashboard,
- products,
- categories,
- collections,
- pricing,
- stock,
- media/hero/video,
- orders,
- order status,
- payments,
- refunds/cancellations,
- proof approval workflow,
- customers,
- inquiries,
- support messages,
- coupons/campaigns,
- legal pages,
- homepage/section content,
- SEO,
- settings,
- audit logs.

The admin must allow changing prices, products, images, stock, legal text, product behavior, payment status, and order state.

## 10. Legal Pages

Build Turkish legal page structure for:

- KVKK Aydinlatma Metni,
- Mesafeli Satis Sozlesmesi,
- On Bilgilendirme Formu,
- Iade ve Iptal Politikasi,
- Gizlilik Politikasi,
- Cerez Politikasi,
- Teslimat ve Kargo,
- Kullanici Sozlesmesi if account system requires it.

Legal text may start as structured placeholder text, but routes and consent placement must exist.

## 11. Motion Rules

Motion must serve story and conversion.

Required:

- scroll-scrub video hero,
- smooth but controllable transitions,
- chapter bridges,
- tactile hover states,
- product image depth,
- reduced-motion fallback,
- mobile-specific motion simplification.

Optional after the core is correct:

- audio-reactive silk-string dividers,
- canvas micro-interactions,
- atmospheric product depth layers.

Rejected:

- random fades everywhere,
- template reveal animation,
- motion that delays shopping,
- motion that breaks mobile clarity.

## 12. Build Stack Expectation

Preferred production stack:

- Next.js,
- TypeScript,
- Supabase/Postgres,
- Supabase Auth,
- Supabase Storage,
- RLS,
- server routes for payments,
- webhook handlers,
- Tailwind,
- GSAP,
- Lenis,
- Framer Motion only where appropriate.

If a different stack is used, it must still deliver the same production capabilities.

## 13. First Implementation Milestone

Do not try to build everything visually first.

Build in this order:

1. App shell and routes.
2. Design tokens and typography.
3. Real hero video scroll-scrub prototype.
4. Homepage cinematic chapter system.
5. Storefront data model.
6. Product listing/detail/cart.
7. Account/auth.
8. Checkout skeleton with legal consent.
9. Admin shell.
10. Product/order/admin CRUD.
11. Payment provider integration surfaces.
12. QA across desktop/tablet/mobile.

## 14. Absolute Rejection Tests

Reject the build immediately if:

- first screen is a static image with centered text,
- hero video is not actually used,
- scroll does not control video time,
- store products are hardcoded only,
- cart does not connect to product actions,
- no login/register exists,
- no checkout exists,
- no admin exists,
- legal pages are only footer placeholders,
- language is not Turkish,
- design feels like a beginner template.

## 15. The Final Feeling

The user should feel:

I entered a private Turkish luxury maison.
The website is alive, cinematic, poetic, and calm.
Every beautiful object can become something I can buy, customize, approve, track, or ask about.

That is CHERIE DAY.
