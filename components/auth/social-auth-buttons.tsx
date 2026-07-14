'use client';

import { useFormStatus } from 'react-dom';

import { beginOAuthAction } from '@/app/(site)/hesap/actions';
import type { CustomerAuthProvider } from '@/lib/auth/config';

export function SocialAuthButtons({
  next,
  providers,
}: {
  next: string;
  providers: Record<CustomerAuthProvider, boolean>;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <ProviderForm provider="google" enabled={providers.google} next={next} />
        <ProviderForm provider="apple" enabled={providers.apple} next={next} />
      </div>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-cherie-lace" />
        <span className="text-xs text-cherie-soft-ink">veya e-posta ile devam edin</span>
        <span className="h-px flex-1 bg-cherie-lace" />
      </div>
    </div>
  );
}

function ProviderForm({
  provider,
  enabled,
  next,
}: {
  provider: CustomerAuthProvider;
  enabled: boolean;
  next: string;
}) {
  return (
    <form action={beginOAuthAction}>
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="next" value={next} />
      <ProviderButton provider={provider} enabled={enabled} />
    </form>
  );
}

function ProviderButton({
  provider,
  enabled,
}: {
  provider: CustomerAuthProvider;
  enabled: boolean;
}) {
  const { pending } = useFormStatus();
  const label = provider === 'google' ? 'Google ile devam et' : 'Apple ile devam et';
  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      aria-label={enabled ? label : `${label} — henüz kullanılamıyor`}
      className="flex min-h-11 w-full items-center justify-center gap-3 rounded-control border border-cherie-lace bg-white px-4 py-3 text-sm font-medium text-cherie-ink transition-colors hover:border-cherie-brass hover:bg-cherie-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-burgundy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {provider === 'google' ? <GoogleMark /> : <AppleMark />}
      {pending ? 'Güvenli giriş hazırlanıyor…' : label}
    </button>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
      <path d="M17.05 12.54c-.03-2.63 2.15-3.91 2.25-3.97a4.84 4.84 0 0 0-3.82-2.07c-1.61-.17-3.18.96-4 .96-.84 0-2.1-.94-3.46-.91A5.09 5.09 0 0 0 3.74 9.2c-1.85 3.2-.47 7.9 1.3 10.49.89 1.27 1.92 2.69 3.28 2.64 1.33-.06 1.83-.85 3.44-.85 1.6 0 2.08.85 3.46.82 1.43-.02 2.33-1.27 3.18-2.55a10.45 10.45 0 0 0 1.46-2.97 4.56 4.56 0 0 1-2.81-4.24ZM14.43 4.79A4.64 4.64 0 0 0 15.5 1.45a4.74 4.74 0 0 0-3.07 1.59 4.42 4.42 0 0 0-1.1 3.21 3.9 3.9 0 0 0 3.1-1.46Z" />
    </svg>
  );
}
