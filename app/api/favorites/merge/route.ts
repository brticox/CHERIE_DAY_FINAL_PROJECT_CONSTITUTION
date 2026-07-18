import { NextResponse } from 'next/server';

import { mergeGuestFavorites } from '@/lib/favorites/server';
import { MAX_FAVORITES } from '@/lib/favorites/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

/**
 * Merge a guest's localStorage favorites into the signed-in customer's list.
 * The client sends the id array it holds locally; the server validates,
 * upserts idempotently, and returns the authoritative merged list. The client
 * clears localStorage ONLY after a successful response.
 */
export async function POST(request: Request) {
  let ids: string[] = [];
  try {
    const body = (await request.json()) as { ids?: unknown };
    if (Array.isArray(body?.ids)) {
      ids = body.ids.filter((value): value is string => typeof value === 'string').slice(0, MAX_FAVORITES);
    }
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Geçersiz istek.' },
      { status: 400, headers: NO_STORE },
    );
  }
  const result = await mergeGuestFavorites(ids);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: result.status, headers: NO_STORE },
    );
  }
  return NextResponse.json({ ok: true, ids: result.ids }, { headers: NO_STORE });
}
