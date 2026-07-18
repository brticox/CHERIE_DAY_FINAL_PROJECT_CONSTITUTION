import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { registerAction } from '../actions';
import { authReadiness } from '@/lib/auth/config';
import { safeNextPath } from '@/lib/validation/auth';

export const metadata: Metadata = {
  title: 'Üye Ol',
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next);
  const readiness = authReadiness();
  return (
    <AuthShell
      eyebrow="Yeni Hesap"
      title="Hikâyeniz için güvenli bir yer"
      lead="Seçimlerinizi, siparişlerinizi ve onay süreçlerinizi tek bir Maison hesabında saklayın."
    >
      <AuthForm
        mode="register"
        action={registerAction}
        available={isSupabaseConfigured()}
        next={next}
        providers={readiness.providers}
      />
    </AuthShell>
  );
}
