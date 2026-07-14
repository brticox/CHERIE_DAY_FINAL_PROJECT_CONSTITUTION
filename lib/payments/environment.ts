import type { ProviderReadiness } from './index';

export type PaymentEnvironmentReport = {
  ready: boolean;
  mode: 'sandbox' | 'live' | 'unavailable';
  failures: string[];
};

type PaymentEnvironment = Readonly<Record<string, string | undefined>>;

export function validatePaytrEnvironment(
  env: PaymentEnvironment = process.env,
): PaymentEnvironmentReport {
  const failures: string[] = [];
  const configured = Boolean(
    env.PAYTR_MERCHANT_ID && env.PAYTR_MERCHANT_KEY && env.PAYTR_MERCHANT_SALT,
  );
  const live = env.PAYTR_TEST_MODE === '0';
  if (!configured) failures.push('PAYTR_CREDENTIALS_MISSING');

  let siteUrl: URL | null = null;
  try {
    siteUrl = new URL(env.NEXT_PUBLIC_SITE_URL ?? '');
  } catch {
    failures.push('PAYMENT_SITE_URL_INVALID');
  }
  if (siteUrl && live && ['localhost', '127.0.0.1', '::1'].includes(siteUrl.hostname)) {
    failures.push('PAYTR_LIVE_ON_LOCALHOST_FORBIDDEN');
  }
  if (siteUrl && live && siteUrl.protocol !== 'https:') {
    failures.push('PAYTR_LIVE_REQUIRES_HTTPS');
  }
  if (live && env.APP_ENV !== 'production') {
    failures.push('PAYTR_LIVE_ENVIRONMENT_MISMATCH');
  }
  if (env.APP_ENV === 'production' && !live && configured) {
    failures.push('PAYTR_TEST_CREDENTIALS_IN_PRODUCTION');
  }
  if (env.APP_ENV === 'production' && env.PAYTR_SIMULATOR_SECRET) {
    failures.push('PAYTR_SIMULATOR_FORBIDDEN_IN_PRODUCTION');
  }
  if (env.APP_ENV === 'production' && env.PAYTR_REFUND_SIMULATOR_ENABLED === 'true') {
    failures.push('PAYTR_REFUND_SIMULATOR_FORBIDDEN_IN_PRODUCTION');
  }
  if (env.APP_ENV === 'production' && !env.PAYMENT_WORKER_SECRET) {
    failures.push('PAYMENT_WORKER_SECRET_MISSING');
  }
  if (env.APP_ENV === 'production' && env.NOTIFICATION_RECIPIENT_OVERRIDE) {
    failures.push('PAYMENT_RECIPIENT_OVERRIDE_FORBIDDEN');
  }
  return {
    ready: failures.length === 0,
    mode: !configured ? 'unavailable' : live ? 'live' : 'sandbox',
    failures,
  };
}

export function paytrReadiness(env: PaymentEnvironment = process.env): ProviderReadiness {
  const report = validatePaytrEnvironment(env);
  return {
    provider: 'paytr',
    configured: report.ready,
    label: 'PayTR Güvenli Ödeme',
    mode: report.mode,
    reason: report.ready ? undefined : readinessMessage(report.failures),
  };
}

function readinessMessage(failures: string[]) {
  if (failures.includes('PAYTR_CREDENTIALS_MISSING')) {
    return 'PayTR mağaza anahtarları bekleniyor.';
  }
  return 'Ödeme ortamı güvenlik kontrolünden geçmedi.';
}
