import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { forgotPasswordAction } from '../actions';

export const metadata: Metadata = { title: 'Şifremi Unuttum', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Şifre Yenileme"
      title="Hesabınıza yeniden ulaşın"
      lead="E-posta adresinizi paylaşın; güvenli yenileme bağlantısını size gönderelim."
    >
      <AuthForm mode="forgot" action={forgotPasswordAction} available={isSupabaseConfigured()} />
    </AuthShell>
  );
}
