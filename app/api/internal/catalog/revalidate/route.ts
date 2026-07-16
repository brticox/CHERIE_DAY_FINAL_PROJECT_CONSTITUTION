import { NextResponse } from 'next/server';

import { revalidateCatalog, revalidateStorefrontPaths } from '@/lib/data/catalog-cache';
import { authorizeInternalRequest } from '@/lib/security/internal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Force a public-catalog cache revalidation. Admin mutations already call
 * revalidateCatalog() in-process; this bearer-protected endpoint lets an
 * out-of-band source (a Supabase database webhook on catalog tables, or an
 * operator) invalidate the storefront too — so even direct data changes
 * propagate without a redeploy.
 *
 * Optional JSON body `{ paths: string[] }` additionally clears those exact
 * storefront routes (e.g. a product's PDP), which is required to evict an
 * on-demand-cached notFound() that the broad tag cannot reach.
 */
async function handler(request: Request) {
  if (!authorizeInternalRequest(request.headers.get('authorization'), 'catalog')) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
  }
  let paths: string[] = [];
  try {
    const body = (await request.json()) as { paths?: unknown };
    if (Array.isArray(body?.paths)) {
      paths = body.paths.filter((p): p is string => typeof p === 'string' && p.startsWith('/'));
    }
  } catch {
    // no/invalid body → tag-only revalidation
  }
  revalidateCatalog();
  if (paths.length) revalidateStorefrontPaths(paths);
  return NextResponse.json(
    { ok: true, revalidated: 'catalog', paths },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export const POST = handler;
