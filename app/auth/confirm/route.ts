import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { getAuthConfig } from '@/lib/auth/config';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { safeNextPath } from '@/lib/validation/auth';

const EMAIL_OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

function isEmailOtpType(value: string | null): value is EmailOtpType {
  return Boolean(value && EMAIL_OTP_TYPES.has(value));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = safeNextPath(
    url.searchParams.get('next'),
    type === 'recovery' ? '/hesap/sifreyi-yenile' : '/hesap',
  );

  let appOrigin: string;
  try {
    appOrigin = getAuthConfig().siteUrl.origin;
  } catch {
    return NextResponse.redirect(new URL('/hesap/giris?reason=unavailable', url.origin));
  }

  if (!isSupabaseConfigured() || !tokenHash || !isEmailOtpType(type)) {
    return NextResponse.redirect(
      new URL('/hesap/giris?reason=callback_error', appOrigin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(
      new URL('/hesap/giris?reason=callback_error', appOrigin),
    );
  }

  return NextResponse.redirect(new URL(next, appOrigin));
}
