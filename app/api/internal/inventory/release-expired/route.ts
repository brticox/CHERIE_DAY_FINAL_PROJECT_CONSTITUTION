import { NextResponse } from 'next/server';

import { authorizeInternalRequest } from '@/lib/security/internal-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function releaseExpired(request: Request) {
  if (!authorizeInternalRequest(request.headers.get('authorization'), 'payment')) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
  }

  const { data, error } = await createAdminClient().rpc(
    'release_expired_inventory_reservations',
    { p_batch_size: 250 },
  );
  if (error) {
    return NextResponse.json(
      { ok: false, code: 'inventory_release_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return NextResponse.json(
    { ok: true, released: Number(data ?? 0) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export const POST = releaseExpired;
export const GET = releaseExpired;
