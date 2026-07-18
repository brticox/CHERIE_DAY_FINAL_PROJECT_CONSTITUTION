import { NextResponse } from 'next/server';

import { addFavorite, getFavoritesState, removeFavorite } from '@/lib/favorites/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

/** Current auth state + the customer's favorited product ids (guests: authenticated=false, ids=[]). */
export async function GET() {
  const state = await getFavoritesState();
  return NextResponse.json({ ok: true, ...state }, { headers: NO_STORE });
}

async function productIdFromRequest(request: Request): Promise<string | null> {
  try {
    const body = (await request.json()) as { productId?: unknown };
    return typeof body?.productId === 'string' ? body.productId : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const productId = await productIdFromRequest(request);
  if (!productId) {
    return NextResponse.json(
      { ok: false, message: 'Geçersiz istek.' },
      { status: 400, headers: NO_STORE },
    );
  }
  const result = await addFavorite(productId);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: result.status, headers: NO_STORE },
    );
  }
  return NextResponse.json({ ok: true, ids: result.ids }, { headers: NO_STORE });
}

export async function DELETE(request: Request) {
  const productId = await productIdFromRequest(request);
  if (!productId) {
    return NextResponse.json(
      { ok: false, message: 'Geçersiz istek.' },
      { status: 400, headers: NO_STORE },
    );
  }
  const result = await removeFavorite(productId);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: result.status, headers: NO_STORE },
    );
  }
  return NextResponse.json({ ok: true, ids: result.ids }, { headers: NO_STORE });
}
