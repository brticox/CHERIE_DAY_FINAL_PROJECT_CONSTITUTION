import { NextResponse } from 'next/server';
import { z } from 'zod';

import { removeCartItem, updateCartItem } from '@/lib/cart/server';
import { cartFailure } from '@/lib/cart/response';
import { updateCartItemSchema } from '@/lib/validation/cart';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const idSchema = z.string().uuid();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ 'item-id': string }> },
) {
  try {
    const id = idSchema.parse((await params)['item-id']);
    const input = updateCartItemSchema.parse(await request.json());
    const item = await updateCartItem(id, input.quantity, input.restore);
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    return error instanceof z.ZodError
      ? NextResponse.json(
          { ok: false, code: 'validation_error', message: 'Geçerli bir adet girin.' },
          { status: 400 },
        )
      : cartFailure(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ 'item-id': string }> },
) {
  try {
    const id = idSchema.parse((await params)['item-id']);
    return NextResponse.json({
      ok: true,
      item: await removeCartItem(id),
      message: 'Seçim kaldırıldı.',
    });
  } catch (error) {
    return error instanceof z.ZodError
      ? NextResponse.json(
          { ok: false, code: 'invalid_id', message: 'Seçim bulunamadı.' },
          { status: 404 },
        )
      : cartFailure(error);
  }
}
