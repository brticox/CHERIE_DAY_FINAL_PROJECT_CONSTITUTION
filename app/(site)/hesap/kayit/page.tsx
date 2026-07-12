import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { registerAction } from '../actions';

export const metadata: Metadata = { title: 'Üye Ol', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Yeni Hesap"
      title="Hikâyeniz için güvenli bir yer"
      lead="Seçimlerinizi, siparişlerinizi ve onay süreçlerinizi tek bir Maison hesabında saklayın."
    >
      <AuthForm mode="register" action={registerAction} available={isSupabaseConfigured()} />
    </AuthShell>
  );
}
