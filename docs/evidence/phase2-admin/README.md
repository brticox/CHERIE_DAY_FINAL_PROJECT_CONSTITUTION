# Phase 2 Admin Control Center — Verification Evidence

Verified on 14 July 2026 from branch `phase/02-admin-control-center-20260714`.

## Verified environment

- Next.js development server connected to a real local Supabase stack (Auth, PostgREST, Storage, PostgreSQL, and Kong).
- The database was reset twice from migrations and `supabase/seed.sql`; the final reset replayed every migration through `20260714101500_explicit_authenticated_table_grants.sql` without manual schema repair.
- A local-only `superadmin` Auth account was linked to `staff_users`, then deterministic operational data from `supabase/tests/phase2_browser_seed.sql` was loaded.
- No production, remote Supabase project, deployment, merge, or push was performed.

## Automated gates

| Gate | Result |
| --- | --- |
| ESLint (`npm run lint`) | Passed with zero warnings |
| Vitest (`npm test -- --run`) | 58/58 tests passed |
| TypeScript (`npm run typecheck`) | Passed |
| Next.js production build (`npm run build`) | Passed; 196 pages generated |
| Phase 2 SQL/RLS suite (`npm run test:phase2:db`) | Passed against real local Supabase PostgreSQL |
| Migration replay (`supabase db reset`) | Passed from an empty local database |

The SQL suite verifies anonymous denial, customer isolation, public sanitized views, payment protections, admin RPC denial for anonymous/customer roles, product/media lifecycle, CMS publishing, immutable legal versions, CRM conversion, production/quality/shipment operations, notification retry, staff administration, and audit trails.

## Media upload verification

- The admin upload form was inspected at 1440px and 390px.
- The Codex in-app browser does not support native file chooser uploads, so no browser-click upload is claimed.
- The same authenticated `POST /api/admin/media/upload` endpoint used by the UI was exercised over HTTP with a valid 2.3 MB PNG and an SSR session cookie.
- The endpoint returned `200` with a created media id.
- The resulting `media_assets` row, matching `storage.objects` row, dimensions (`1536×1024`), MIME (`image/png`), content metadata, and `media.uploaded` audit event were verified.
- `1440-media-upload-success.png` records the uploaded asset rendered in the admin library.
- A direct authenticated Storage policy check also accepted the user's own path (`200`) and rejected a forged other-user path (`400`).

## Browser and accessibility checks

- Authenticated admin navigation, real record detail pages, command palette focus, notification access for `superadmin`, and dynamic operational data were verified.
- Browser console errors: none after the final pass.
- All tested pages had one meaningful primary heading, no empty unnamed buttons, no visible unlabeled form fields, and no document-level horizontal overflow.
- Missing accessible names found in catalog, CMS, proofs, production, shipping, CRM, services, reservations, notifications, customers, and audit filters/forms were corrected and rechecked.
- The command palette opened as a labelled dialog and focused its search input.

## Responsive matrix

| Viewport | Evidence | Result |
| --- | --- | --- |
| 1440×900 | Dashboard plus 22 operational/detail views and command palette | Passed |
| 1280×900 | Dashboard | Passed |
| 1024×900 | Dashboard | Passed |
| 768×900 | Dashboard and product editor | Passed |
| 430×844 | Dashboard and lead inbox | Passed |
| 390×844 | Dashboard and media upload | Passed |
| 375×812 | Dashboard and customer profile | Passed |

At every required width, `documentElement.scrollWidth` equalled `clientWidth` on the checked pages.

## Representative evidence

- `1440-dashboard.png`
- `1440-command-palette.png`
- `1440-product-editor.png`
- `1440-media-upload-success.png`
- `1440-cms-home-editor.png`
- `1440-order-detail.png`
- `1440-production-board.png`
- `1440-customer-profile.png`
- `1440-reservation-detail.png`
- `1440-notifications.png`
- `1440-audit-log.png`
- `768-product-editor.png`
- `430-lead-inbox.png`
- `390-media-upload.png`
- `375-customer-profile.png`

The PNG files in this directory are local QA evidence and contain seeded, non-production records only.
