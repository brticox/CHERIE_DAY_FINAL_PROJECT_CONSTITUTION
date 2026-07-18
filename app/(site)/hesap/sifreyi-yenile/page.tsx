import type { Metadata } from 'next';

import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { safeNextPath } from '@/lib/validation/auth';

export const metadata: Metadata = {
  title: 'Şifreyi Yenile',
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
      eyebrow="Yeni Şifre"
      title="Yeni anahtarınızı belirleyin"
      lead="Güçlü ve yalnızca bu hesapta kullandığınız bir şifre seçin."
    >
      <PasswordRecoveryForm
        mode="update"
        available={isSupabaseConfigured()}
        next={next}
      />
    </AuthShell>
  );
}
