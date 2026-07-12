import { NextResponse } from 'next/server';

import { addCartItem } from '@/lib/cart/server';
import { cartFailure } from '@/lib/cart/response';
import { addCartItemSchema } from '@/lib/validation/cart';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = addCartItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          code: 'validation_error',
          message: 'Lütfen ürün seçeneklerini kontrol edin.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    const item = await addCartItem(parsed.data);
    return NextResponse.json(
      { ok: true, item, message: 'Ürün Seçimlerim’e eklendi.' },
      { status: 201 },
    );
  } catch (error) {
    return cartFailure(error);
  }
}
