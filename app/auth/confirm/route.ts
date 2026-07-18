import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { getAuthConfig } from '@/lib/auth/config';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { appendInternalQuery, authPathWithNext, safeNextPath } from '@/lib/validation/auth';
import { enqueueAccountNotification } from '@/lib/notifications/account';
import { mergeGuestCartForCurrentUser } from '@/lib/cart/server';

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
  const loginError = (reason: string) =>
    appendInternalQuery(authPathWithNext('/hesap/giris', next), 'reason', reason);

  let appOrigin: string;
  try {
    appOrigin = getAuthConfig().siteUrl.origin;
  } catch {
    return NextResponse.redirect(new URL(loginError('unavailable'), url.origin));
  }

  if (!isSupabaseConfigured() || !tokenHash || !isEmailOtpType(type)) {
    return NextResponse.redirect(
      new URL(loginError('callback_error'), appOrigin),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(loginError('callback_error'), appOrigin),
    );
  }

  if ((type === 'signup' || type === 'invite') && data.user) {
    const rpc = supabase.rpc.bind(supabase) as unknown as (
      name: string,
      args?: Record<string, unknown>,
    ) => Promise<{ data: { status: string } | null; error: { code: string } | null }>;
    const { data: profile, error: profileError } = await rpc(
      'ensure_current_customer_profile',
    );
    if (profileError || !profile || profile.status !== 'active') {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL(loginError('account_blocked'), appOrigin),
      );
    }
    await rpc('record_current_identity_event', {
      p_provider: 'email',
      p_event_type: 'email_confirmed',
    });
    await enqueueAccountNotification(data.user.id, 'welcome');
    try {
      await mergeGuestCartForCurrentUser();
    } catch {
      return NextResponse.redirect(
        new URL(appendInternalQuery(next, 'warning', 'cart_merge'), appOrigin),
      );
    }
  }

  return NextResponse.redirect(new URL(next, appOrigin));
}
