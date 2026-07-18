'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/data/routes';
import type { AuthActionState } from '@/lib/validation/auth';
import { authPathWithNext, safeNextPath } from '@/lib/validation/auth';

type Mode = 'forgot' | 'update';

const inputClass =
  'h-12 w-full rounded-control border border-cherie-brass/30 bg-cherie-ivory px-4 text-cherie-ink outline-none transition focus:border-cherie-burgundy focus:ring-2 focus:ring-focus/30';

const PASSWORD_RULES = [
  { label: 'En az 12 karakter', test: (value: string) => value.length >= 12 },
  { label: 'Bir küçük harf', test: (value: string) => /[a-zçğıöşü]/.test(value) },
  { label: 'Bir büyük harf', test: (value: string) => /[A-ZÇĞİÖŞÜ]/.test(value) },
  { label: 'Bir rakam', test: (value: string) => /[0-9]/.test(value) },
  {
    label: 'Bir özel karakter',
    test: (value: string) => /[^a-zA-ZÇĞİÖŞÜçğıöşü0-9]/.test(value),
  },
] as const;

export function PasswordRecoveryForm({
  mode,
  available,
  next,
}: {
  mode: Mode;
  available: boolean;
  next?: string;
}) {
  const [state, setState] = useState<AuthActionState>({ status: 'idle' });
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!available) {
    return (
      <div className="rounded-card border border-cherie-warning/40 bg-cherie-warning/10 p-5">
        Hesap sistemi şu anda kullanılamıyor.
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({ status: 'idle' });

    try {
      const response = await fetch(`/api/auth/password/${mode}`, {
        method: 'POST',
        body: new FormData(event.currentTarget),
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      const result = (await response.json()) as AuthActionState;
      setState(result);

      if (mode === 'update' && response.ok && result.status === 'success') {
        const login = new URL('/hesap/giris', window.location.origin);
        login.searchParams.set('reason', 'password_updated');
        login.searchParams.set('next', safeNextPath(next));
        window.location.assign(`${login.pathname}${login.search}`);
      }
    } catch {
      setState({
        status: 'error',
        message: 'İşlem tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.',
      });
    } finally {
      setPending(false);
    }
  }

  const error = (field: string) => state.fieldErrors?.[field]?.[0];
  const passwordReady = PASSWORD_RULES.every((rule) => rule.test(password));
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <form onSubmit={submit} className="mt-5 space-y-5" noValidate>
      <input type="hidden" name="next" value={safeNextPath(next)} />
      {mode === 'forgot' ? (
        <Field label="E-posta" error={error('email')} icon={<Mail />}>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass}
          />
        </Field>
      ) : (
        <>
          <Field label="Yeni Şifre" error={error('password')} icon={<LockKeyhole />}>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`${inputClass} pr-12`}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                className="absolute right-0 top-0 grid size-12 place-items-center text-cherie-soft-ink"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </Field>

          <ul className="grid gap-2 rounded-card border border-cherie-brass/25 bg-cherie-paper/70 p-4 text-sm sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 ${met ? 'text-cherie-success' : 'text-cherie-soft-ink'}`}
                >
                  {met ? <Check className="size-4" /> : <X className="size-4" />}
                  {rule.label}
                </li>
              );
            })}
          </ul>

          <Field
            label="Şifre Tekrar"
            error={error('confirmPassword')}
            icon={<LockKeyhole />}
          >
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={inputClass}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Field>
          {confirmPassword && (
            <p
              className={`text-sm ${passwordsMatch ? 'text-cherie-success' : 'text-cherie-error'}`}
            >
              {passwordsMatch ? 'Şifreler eşleşiyor.' : 'Şifreler henüz eşleşmiyor.'}
            </p>
          )}
        </>
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

      <Button
        type="submit"
        size="lg"
        disabled={pending || (mode === 'update' && (!passwordReady || !passwordsMatch))}
        className="w-full"
      >
        {pending ? (
          <>
            <LoaderCircle className="animate-spin" /> Güvenle işleniyor…
          </>
        ) : mode === 'forgot' ? (
          'Yenileme Bağlantısı Gönder'
        ) : (
          'Şifremi Güncelle'
        )}
      </Button>

      {mode === 'update' && (
        <p className="text-center text-sm text-cherie-soft-ink">
          Bağlantı çalışmıyor mu?{' '}
          <Link
            href={authPathWithNext(ROUTES.hesapSifremiUnuttum, next)}
            className="text-cherie-burgundy underline"
          >
            Yeni bağlantı isteyin
          </Link>
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-cherie-ink">
        <span className="[&_svg]:size-4 [&_svg]:text-cherie-brass">{icon}</span>
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-cherie-error">{error}</span>}
    </label>
  );
}
