import { NextResponse } from 'next/server';

import { cartFailure } from '@/lib/cart/response';
import { getCart } from '@/lib/cart/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(
      { ok: true, cart: await getCart() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return cartFailure(error);
  }
}
