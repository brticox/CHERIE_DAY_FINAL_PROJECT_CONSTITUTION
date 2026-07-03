# AI Builder Master Prompt

Use this prompt for Claude, Kimi, or any implementation agent after the constitution is cleaned.

## Prompt

You are implementing CHERIE DAY, a Turkey-only luxury wedding, invitation, gift, digital memory, and celebration commerce maison.

Read first:

- `00_AI_OPEN_FIRST_DESIGN_AND_BUILD_ORDER.md`
- `00_READ_ME_FIRST.md`
- `docs/03_HERO_CINEMATIC_SYSTEM.md`
- `docs/07_PLATFORM_ARCHITECTURE.md`
- `docs/08_DATA_MODEL_AND_CMS_SCHEMA.md`
- `docs/09_COMMERCE_BIBLE.md`
- `docs/19_TURKISH_LUXURY_COMMERCE_SCOPE.md`
- `docs/20_PAYMENT_AND_LEGAL_RESEARCH.md`
- `docs/24_TURKEY_LEGAL_PAYMENT_POLICY_LOCK.md`
- `docs/33_NEXT_GEN_COMMERCE_AND_ADMIN_EXPERIENCE.md`

Do not treat old hero ideas or rejected prototypes as binding.
The opening visual experience must be concepted separately before implementation.

Build the actual platform:

- public website,
- store,
- category and collection pages,
- product detail pages,
- cart,
- checkout,
- login/register,
- customer account,
- order tracking,
- proof approval,
- support/inquiry,
- admin system,
- payment integration surfaces,
- legal pages and consent points.

All public customer-facing copy must be Turkish.

Preferred stack:

- Next.js,
- TypeScript,
- Supabase/Postgres,
- Supabase Auth,
- Supabase Storage,
- RLS,
- Tailwind,
- server routes for payments,
- webhook handlers.

Payments:

- Turkey-only commerce,
- iyzico,
- PayTR,
- Turkish cards,
- TROY where available,
- international Visa/Mastercard/AMEX where enabled.

Admin:

- products,
- categories,
- collections,
- pricing,
- stock,
- media/content,
- orders,
- payments,
- refunds/cancellations,
- proof approvals,
- customers,
- inquiries/support,
- legal pages,
- SEO,
- settings,
- audit logs.

Before coding the creative opening, deliver a separate concept package:

1. concept name,
2. first viewport composition,
3. interaction/motion plan,
4. asset list,
5. desktop/tablet/mobile behavior,
6. performance budget,
7. reduced-motion fallback,
8. store/inquiry connection points.

Reject any implementation that is only a landing page, only hardcoded products, has no checkout, has no admin, has no Turkish legal flow, or distorts brand marks.
