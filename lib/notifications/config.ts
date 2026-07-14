import 'server-only';

import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const configSchema = z.object({
  APP_ENV: z.enum(['development', 'preview', 'production']).default('development'),
  NOTIFICATION_SEND_ENABLED: booleanString.default('false'),
  NOTIFICATION_FROM_EMAIL: z.string().email().optional(),
  NOTIFICATION_FROM_NAME: z.string().min(2).max(80).default('CHERIE DAY'),
  NOTIFICATION_REPLY_TO_EMAIL: z.string().email().optional(),
  EMAIL_HELLO: z.string().email().optional(),
  EMAIL_SUPPORT: z.string().email().optional(),
  EMAIL_ORDERS: z.string().email().optional(),
  EMAIL_PAYMENTS: z.string().email().optional(),
  EMAIL_LEGAL: z.string().email().optional(),
  NOTIFICATION_RECIPIENT_OVERRIDE: z.string().email().optional(),
  NOTIFICATION_STAFF_EMAILS: z.string().optional(),
  RESEND_API_KEY: z.string().min(10).optional(),
  RESEND_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
});

export function getNotificationConfig() {
  const config = configSchema.parse(process.env);
  if (config.APP_ENV === 'production' && config.NOTIFICATION_RECIPIENT_OVERRIDE) {
    throw new Error('Production ortamında alıcı yönlendirmesi kullanılamaz.');
  }
  if (
    config.NOTIFICATION_SEND_ENABLED &&
    (!config.RESEND_API_KEY || !config.NOTIFICATION_FROM_EMAIL)
  ) {
    throw new Error('Bildirim gönderimi açıkken Resend ve gönderen adresi zorunludur.');
  }
  if (
    config.APP_ENV === 'production' &&
    config.NOTIFICATION_SEND_ENABLED &&
    !config.RESEND_WEBHOOK_SECRET
  ) {
    throw new Error('Üretim bildirimleri için Resend webhook imza sırrı zorunludur.');
  }
  return config;
}

export function notificationReadiness() {
  try {
    const config = getNotificationConfig();
    return {
      ready:
        config.NOTIFICATION_SEND_ENABLED &&
        Boolean(config.RESEND_API_KEY && config.NOTIFICATION_FROM_EMAIL),
      mode: config.NOTIFICATION_SEND_ENABLED ? 'resend' : 'capture',
    } as const;
  } catch {
    return { ready: false, mode: 'invalid' } as const;
  }
}

export function notificationReplyTo(templateKey: string) {
  const config = getNotificationConfig();
  const fallback = config.NOTIFICATION_REPLY_TO_EMAIL;
  if (/payment|refund|paid/.test(templateKey)) return config.EMAIL_PAYMENTS ?? fallback;
  if (/order|proof|revision|production|quality|packed|shipped|delivered/.test(templateKey)) {
    return config.EMAIL_ORDERS ?? fallback;
  }
  if (/intake|contact|appointment|quote|dream/.test(templateKey)) {
    return config.EMAIL_HELLO ?? fallback;
  }
  return config.EMAIL_SUPPORT ?? fallback;
}
