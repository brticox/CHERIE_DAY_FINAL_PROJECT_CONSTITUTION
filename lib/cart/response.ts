import { NextResponse } from 'next/server';

import { CartError } from './server';

export function cartFailure(error: unknown) {
  if (error instanceof CartError) {
    return NextResponse.json(
      { ok: false, code: error.code, message: error.message },
      { status: error.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }
  return NextResponse.json(
    { ok: false, code: 'cart_error', message: 'Seçimlerim işlemi tamamlanamadı.' },
    { status: 500, headers: { 'Cache-Control': 'no-store' } },
  );
}
