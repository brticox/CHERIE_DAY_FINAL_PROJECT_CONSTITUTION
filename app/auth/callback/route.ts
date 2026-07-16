import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { safeNextPath } from '@/lib/validation/auth';
import { mergeGuestCartForCurrentUser } from '@/lib/cart/server';
import { getAuthConfig } from '@/lib/auth/config';
import { enqueueAccountNotification } from '@/lib/notifications/account';

const PROVIDERS = new Set(['email', 'google', 'apple']);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));
  const requestedProvider = url.searchParams.get('provider');
  let appOrigin: string;
  try {
    appOrigin = getAuthConfig().siteUrl.origin;
  } catch {
    return NextResponse.redirect(new URL('/hesap/giris?reason=unavailable', url.origin));
  }

  if (url.searchParams.has('error')) {
    return NextResponse.redirect(
      new URL('/hesap/giris?reason=provider_cancelled', appOrigin),
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/hesap/giris?reason=unavailable', appOrigin));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: userData } = await supabase.auth.getUser();
      const requestedIdentity =
        (requestedProvider === 'google' || requestedProvider === 'apple') &&
        userData.user?.identities?.some(
          (identity) => identity.provider === requestedProvider,
        )
          ? requestedProvider
          : null;
      const provider = String(
        requestedIdentity ?? userData.user?.app_metadata.provider ?? 'email',
      );
      if (!userData.user || !PROVIDERS.has(provider)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL('/hesap/giris?reason=callback_error', appOrigin),
        );
      }

      const identityRpc = supabase.rpc.bind(supabase) as unknown as (
        name: string,
        args?: Record<string, unknown>,
      ) => Promise<{ data: { status: string } | null; error: { code: string } | null }>;
      const { data: profile, error: profileError } = await identityRpc(
        'ensure_current_customer_profile',
      );
      if (profileError || !profile || profile.status !== 'active') {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          new URL('/hesap/giris?reason=account_blocked', appOrigin),
        );
      }

      await identityRpc('record_current_identity_event', {
        p_provider: provider,
        p_event_type: 'signed_in',
      });
      await enqueueAccountNotification(userData.user.id, 'welcome');
      try {
        await mergeGuestCartForCurrentUser();
      } catch {
        return NextResponse.redirect(new URL('/hesap?warning=cart_merge', appOrigin));
      }
      return NextResponse.redirect(new URL(next, appOrigin));
    }
  }

  return NextResponse.redirect(new URL('/hesap/giris?reason=callback_error', appOrigin));
}
