'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/data/routes';
import { INITIAL_AUTH_STATE, type AuthActionState } from '@/lib/validation/auth';

type Mode = 'login' | 'register' | 'forgot' | 'update';
type Action = (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;

export function AuthForm({
  mode,
  action,
  available,
  next,
}: {
  mode: Mode;
  action: Action;
  available: boolean;
  next?: string;
}) {
  const [state, formAction] = useActionState(action, INITIAL_AUTH_STATE);
  const [showPassword, setShowPassword] = useState(false);

  if (!available) {
    return (
      <div
        role="status"
        className="rounded-card border border-cherie-warning/40 bg-cherie-warning/10 p-5"
      >
        <p className="font-medium text-cherie-ink">
          Hesap sistemi şu anda kullanılamıyor.
        </p>
        <p className="mt-1 text-sm text-cherie-soft-ink">
          Güvenli bağlantı yapılandırıldıktan sonra giriş ve üyelik işlemleri açılacaktır.
        </p>
      </div>
    );
  }

  const error = (field: string) => state.fieldErrors?.[field]?.[0];
  const needsPassword = mode === 'login' || mode === 'register' || mode === 'update';

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {mode === 'register' && (
        <Field label="Ad Soyad" error={error('name')} icon={<UserRound />}>
          <input
            name="name"
            type="text"
            autoComplete="name"
            className={inputClass(Boolean(error('name')))}
          />
        </Field>
      )}

      {mode !== 'update' && (
        <Field label="E-posta" error={error('email')} icon={<Mail />}>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass(Boolean(error('email')))}
          />
        </Field>
      )}

      {mode === 'register' && (
        <Field label="Telefon" error={error('phone')} icon={<Phone />} optional>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="5xx xxx xx xx"
            className={inputClass(Boolean(error('phone')))}
          />
        </Field>
      )}

      {needsPassword && (
        <Field
          label={mode === 'update' ? 'Yeni Şifre' : 'Şifre'}
          error={error('password')}
          icon={<LockKeyhole />}
        >
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={`${inputClass(Boolean(error('password')))} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              className="absolute right-1 top-1 grid size-9 place-items-center rounded-control text-cherie-soft-ink hover:bg-cherie-paper"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
      )}

      {(mode === 'register' || mode === 'update') && (
        <Field
          label="Şifre Tekrar"
          error={error('confirmPassword')}
          icon={<LockKeyhole />}
        >
          <input
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={inputClass(Boolean(error('confirmPassword')))}
          />
        </Field>
      )}

      {mode === 'register' && (
        <div>
          <label className="flex items-start gap-3 text-sm text-cherie-soft-ink">
            <input
              name="consent"
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-cherie-burgundy"
            />
            <span>
              <Link
                href={`${ROUTES.kurumsal}/kvkk-aydinlatma`}
                target="_blank"
                className="text-cherie-burgundy underline"
              >
                KVKK Aydınlatma Metni
              </Link>{' '}
              kapsamında kişisel verilerimin hesap oluşturma amacıyla işleneceği konusunda
              bilgilendirildim.
            </span>
          </label>
          {error('consent') && (
            <p className="mt-1 text-sm text-cherie-error">{error('consent')}</p>
          )}
        </div>
      )}

      {mode === 'login' && (
        <div className="text-right">
          <Link
            href={ROUTES.hesapSifremiUnuttum}
            className="text-sm text-cherie-burgundy hover:underline"
          >
            Şifremi Unuttum
          </Link>
        </div>
      )}

      {state.status !== 'idle' && state.message && (
        <div
          role="status"
          aria-live="polite"
          className={
            state.status === 'success'
              ? 'rounded-card border border-cherie-success/30 bg-cherie-success/10 px-4 py-3 text-sm text-cherie-success'
              : 'rounded-card border border-cherie-error/30 bg-cherie-error/10 px-4 py-3 text-sm text-cherie-error'
          }
        >
          {state.message}
        </div>
      )}

      <SubmitButton mode={mode} />

      {mode === 'login' && (
        <p className="text-center text-sm text-cherie-soft-ink">
          Henüz hesabınız yok mu?{' '}
          <Link
            href={ROUTES.hesapKayit}
            className="font-medium text-cherie-burgundy hover:underline"
          >
            Üye Ol
          </Link>
        </p>
      )}
      {mode === 'register' && (
        <p className="text-center text-sm text-cherie-soft-ink">
          Zaten hesabınız var mı?{' '}
          <Link
            href={ROUTES.hesapGiris}
            className="font-medium text-cherie-burgundy hover:underline"
          >
            Giriş Yap
          </Link>
        </p>
      )}
    </form>
  );
}

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  const labels: Record<Mode, string> = {
    login: 'Giriş Yap',
    register: 'Hesabımı Oluştur',
    forgot: 'Yenileme Bağlantısı Gönder',
    update: 'Şifremi Güncelle',
  };
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? (
        <>
          <LoaderCircle className="animate-spin" /> Güvenle işleniyor…
        </>
      ) : (
        labels[mode]
      )}
    </Button>
  );
}

function Field({
  label,
  error,
  icon,
  optional,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-cherie-ink">
        <span className="[&_svg]:size-4 [&_svg]:text-cherie-brass">{icon}</span>
        {label}
        {optional && (
          <span className="ml-auto text-xs font-normal text-cherie-soft-ink">
            İsteğe bağlı
          </span>
        )}
      </span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-sm text-cherie-error">
          {error}
        </span>
      )}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `cherie-field ${hasError ? 'border-cherie-error' : ''}`;
}
