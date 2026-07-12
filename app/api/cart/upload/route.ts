import { NextResponse } from 'next/server';

import { uploadCartFile } from '@/lib/cart/server';
import { cartFailure } from '@/lib/cart/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > 10.5 * 1024 * 1024)
      return NextResponse.json(
        {
          ok: false,
          code: 'file_too_large',
          message: 'Dosya boyutu en fazla 10 MB olabilir.',
        },
        { status: 413 },
      );
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File))
      return NextResponse.json(
        { ok: false, code: 'file_required', message: 'Lütfen bir dosya seçin.' },
        { status: 400 },
      );
    return NextResponse.json(
      { ok: true, file: await uploadCartFile(file) },
      { status: 201 },
    );
  } catch (error) {
    return cartFailure(error);
  }
}
