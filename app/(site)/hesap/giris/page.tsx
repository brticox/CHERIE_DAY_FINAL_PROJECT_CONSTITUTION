import type { Metadata } from 'next';

import { AuthForm } from '@/components/auth/auth-form';
import { AuthShell } from '@/components/auth/auth-shell';
import { isSupabaseConfigured } from '@/lib/supabase/public';
import { safeNextPath } from '@/lib/validation/auth';
import { loginAction } from '../actions';

export const metadata: Metadata = { title: 'Giriş Yap', robots: { index: false, follow: false } };

const REASONS: Record<string, string> = {
  session: 'Devam etmek için hesabınıza giriş yapın.',
  unavailable: 'Hesap altyapısı henüz yapılandırılmadı.',
  callback_error: 'Bağlantı doğrulanamadı. Lütfen tekrar deneyin.',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  return (
    <AuthShell
      eyebrow="Hesabım"
      title="Tekrar hoş geldiniz"
      lead={REASONS[params.reason ?? ''] ?? 'Siparişlerinize, tasarım onaylarınıza ve CHERIE DAY yolculuğunuza güvenle dönün.'}
    >
      <AuthForm mode="login" action={loginAction} available={isSupabaseConfigured()} next={next} />
    </AuthShell>
  );
}
