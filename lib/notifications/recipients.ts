import 'server-only';

import { NotificationError } from './errors';
import { getNotificationConfig } from './config';

export function resolveRecipient(kind: string, rowEmail: string | null, templateKey = '') {
  const config = getNotificationConfig();
  const candidate = kind === 'staff' ? staffRecipient(templateKey) : rowEmail;
  const resolved = config.NOTIFICATION_RECIPIENT_OVERRIDE ?? candidate;
  if (!resolved || !zEmail(resolved)) {
    throw new NotificationError('Geçerli bildirim alıcısı bulunamadı.', 'missing_recipient', false);
  }
  const normalized = resolved.toLowerCase();
  if (config.APP_ENV === 'staging' && config.NOTIFICATION_SEND_ENABLED) {
    const allowlist = new Set(
      config.NOTIFICATION_STAGING_RECIPIENT_ALLOWLIST
        ?.split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(zEmail),
    );
    if (!allowlist.has(normalized)) {
      throw new NotificationError(
        'Staging alıcısı onaylı listede değil.',
        'staging_recipient_blocked',
        false,
      );
    }
  }
  return normalized;
}

function staffRecipient(templateKey: string) {
  const config = getNotificationConfig();
  if (/payment|refund|reconciliation/.test(templateKey)) return config.EMAIL_PAYMENTS;
  if (/order|proof|production|shipment|quality/.test(templateKey)) return config.EMAIL_ORDERS;
  if (/legal|privacy/.test(templateKey)) return config.EMAIL_LEGAL;
  if (/auth|support|email|worker|notification/.test(templateKey)) return config.EMAIL_SUPPORT;
  return config.EMAIL_HELLO ?? config.NOTIFICATION_STAFF_EMAILS
    ?.split(',')
    .map((email) => email.trim())
    .find(Boolean);
}

function zEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
