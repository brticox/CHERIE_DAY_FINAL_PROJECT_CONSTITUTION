import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { updatePasswordAction } from '../actions';

export const metadata: Metadata = { title: 'Şifreyi Yenile', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <AuthShell
      eyebrow="Yeni Şifre"
      title="Yeni anahtarınızı belirleyin"
      lead="Güçlü ve yalnızca bu hesapta kullandığınız bir şifre seçin."
    >
      <AuthForm mode="update" action={updatePasswordAction} available={isSupabaseConfigured()} />
    </AuthShell>
  );
}

