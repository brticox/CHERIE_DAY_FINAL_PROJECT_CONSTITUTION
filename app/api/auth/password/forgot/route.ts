import { NextResponse } from 'next/server';

import { getAuthConfig } from '@/lib/auth/config';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { forgotPasswordSchema } from '@/lib/validation/auth';

const SAFE_MESSAGE =
  'Bu adresle bir hesap varsa şifre yenileme bağlantısı e-postanıza gönderildi.';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { status: 'error', message: 'İstek doğrulanamadı.' },
      { status: 403 },
    );
  }

  const parsed = forgotPasswordSchema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'E-posta adresinizi kontrol edin.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { status: 'error', message: 'Hesap sistemi şu anda kullanılamıyor.' },
      { status: 503 },
    );
  }

  try {
    const siteUrl = getAuthConfig().siteUrl;
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: new URL('/auth/confirm?next=/hesap/sifreyi-yenile', siteUrl).toString(),
    });
  } catch {
    // Deliberately return the same response to prevent account enumeration.
  }

  return NextResponse.json({ status: 'success', message: SAFE_MESSAGE });
}
