import type { Metadata } from 'next';

import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { safeNextPath } from '@/lib/validation/auth';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum',
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next);
  return (
    <AuthShell
      eyebrow="Şifre Yenileme"
      title="Hesabınıza yeniden ulaşın"
      lead="E-posta adresinizi paylaşın; güvenli yenileme bağlantısını size gönderelim."
    >
      <PasswordRecoveryForm
        mode="forgot"
        available={isSupabaseConfigured()}
        next={next}
      />
    </AuthShell>
  );
}
