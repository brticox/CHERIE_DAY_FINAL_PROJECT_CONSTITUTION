'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  safeNextPath,
  updatePasswordSchema,
  type AuthActionState,
} from '@/lib/validation/auth';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';
import { mergeGuestCartForCurrentUser } from '@/lib/cart/server';
import { authCallbackUrl, getAuthConfig } from '@/lib/auth/config';

const UNAVAILABLE: AuthActionState = {
  status: 'error',
  message: 'Hesap sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
};

function values(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function validationError(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}) {
  return {
    status: 'error' as const,
    message: 'Lütfen işaretli alanları kontrol edin.',
    fieldErrors: error.flatten().fieldErrors,
  };
}

export async function loginAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(values(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured()) return UNAVAILABLE;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: 'error',
      message: 'E-posta veya şifre hatalı. Bilgilerinizi kontrol edip tekrar deneyin.',
    };
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
    return {
      status: 'error',
      message: 'Hesabınıza şu anda erişilemiyor. Destek ekibimizle iletişime geçin.',
    };
  }

  await identityRpc('record_current_identity_event', {
    p_provider: 'email',
    p_event_type: 'signed_in',
  });
  await mergeGuestCartForCurrentUser();

  redirect(safeNextPath(parsed.data.next));
}

export async function registerAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = values(formData);
  const parsed = registerSchema.safeParse({ ...raw, consent: raw.consent === 'on' });
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured()) return UNAVAILABLE;

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/hesap`,
      data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
    },
  });

  if (error) {
    return {
      status: 'error',
      message:
        'Hesabınız oluşturulamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.',
    };
  }

  if (data.session) redirect('/hesap');

  return {
    status: 'success',
    message:
      'Doğrulama bağlantısını e-posta adresinize gönderdik. Gelen kutunuzu kontrol edin.',
  };
}

export async function forgotPasswordAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(values(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured()) return UNAVAILABLE;

  const supabase = await createClient();
  let siteUrl: URL;
  try {
    siteUrl = getAuthConfig().siteUrl;
  } catch {
    return UNAVAILABLE;
  }
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: new URL(
      '/auth/callback?next=/hesap/sifreyi-yenile',
      siteUrl,
    ).toString(),
  });

  // Deliberately identical for existing/non-existing accounts to prevent enumeration.
  return {
    status: 'success',
    message:
      'Bu adresle bir hesap varsa şifre yenileme bağlantısı e-postanıza gönderildi.',
  };
}

export async function updatePasswordAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse(values(formData));
  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseConfigured()) return UNAVAILABLE;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      status: 'error',
      message: 'Bağlantının süresi dolmuş. Yeni bir bağlantı isteyin.',
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error)
    return {
      status: 'error',
      message: 'Şifreniz güncellenemedi. Lütfen tekrar deneyin.',
    };

  return {
    status: 'success',
    message: 'Şifreniz güvenle güncellendi. Hesabınıza dönebilirsiniz.',
  };
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/hesap/giris');
}

const oauthSchema = z.object({
  provider: z.enum(['google', 'apple']),
  next: z.string().optional(),
});

export async function beginOAuthAction(formData: FormData) {
  const parsed = oauthSchema.safeParse(values(formData));
  if (!parsed.success || !isSupabaseConfigured()) {
    redirect('/hesap/giris?reason=provider_unavailable');
  }

  const next = safeNextPath(parsed.data.next);
  let config: ReturnType<typeof getAuthConfig>;
  try {
    config = getAuthConfig();
  } catch {
    redirect('/hesap/giris?reason=provider_unavailable');
  }
  if (!config.providers[parsed.data.provider]) {
    redirect('/hesap/giris?reason=provider_unavailable');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: parsed.data.provider,
    options: {
      redirectTo: authCallbackUrl(next, parsed.data.provider),
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) redirect('/hesap/giris?reason=provider_error');
  redirect(data.url);
}
