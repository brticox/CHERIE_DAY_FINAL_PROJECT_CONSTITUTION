import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { safeNextPath } from '@/lib/validation/auth';
import { loginAction } from '../actions';
import { authReadiness } from '@/lib/auth/config';

export const metadata: Metadata = {
  title: 'Giriş Yap',
  robots: { index: false, follow: false },
};

const REASONS: Record<string, string> = {
  session: 'Devam etmek için hesabınıza giriş yapın.',
  unavailable: 'Hesap altyapısı henüz yapılandırılmadı.',
  callback_error: 'Bağlantı doğrulanamadı. Lütfen tekrar deneyin.',
  provider_cancelled:
    'Giriş işlemi tamamlanmadı. Hesabınızda herhangi bir değişiklik yapılmadı.',
  provider_error:
    'Giriş sağlayıcısına şu anda ulaşılamıyor. E-posta ile devam edebilirsiniz.',
  provider_unavailable: 'Bu giriş yöntemi henüz güvenli biçimde yapılandırılmadı.',
  account_blocked: 'Hesabınıza şu anda erişilemiyor. Destek ekibimizle iletişime geçin.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const readiness = authReadiness();
  return (
    <AuthShell
      eyebrow="Hesabım"
      title="Tekrar hoş geldiniz"
      lead={
        REASONS[params.reason ?? ''] ??
        'Siparişlerinize, tasarım onaylarınıza ve CHERIE DAY yolculuğunuza güvenle dönün.'
      }
    >
      <AuthForm
        mode="login"
        action={loginAction}
        available={isSupabaseConfigured()}
        next={next}
        providers={readiness.providers}
      />
    </AuthShell>
  );
}
