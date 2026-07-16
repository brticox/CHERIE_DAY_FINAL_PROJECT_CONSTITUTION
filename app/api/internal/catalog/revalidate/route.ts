import { NextResponse } from 'next/server';

import { revalidateCatalog } from '@/lib/data/catalog-cache';
import { authorizeInternalRequest } from '@/lib/security/internal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Force a public-catalog cache revalidation. Admin mutations already call
 * revalidateCatalog() in-process; this bearer-protected endpoint lets an
 * out-of-band source (a Supabase database webhook on catalog tables, or an
 * operator) invalidate the storefront too — so even direct data changes
 * propagate without a redeploy.
 */
async function handler(request: Request) {
  if (!authorizeInternalRequest(request.headers.get('authorization'), 'catalog')) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
  }
  revalidateCatalog();
  return NextResponse.json(
    { ok: true, revalidated: 'catalog' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export const POST = handler;
