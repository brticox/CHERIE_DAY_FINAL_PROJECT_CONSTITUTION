import 'server-only';

import { NotificationError } from './errors';
import { getNotificationConfig } from './config';

export function resolveRecipient(kind: string, rowEmail: string | null) {
  const config = getNotificationConfig();
  const candidate = kind === 'staff'
    ? config.NOTIFICATION_STAFF_EMAILS?.split(',').map((email) => email.trim()).find(Boolean)
    : rowEmail;
  const resolved = config.NOTIFICATION_RECIPIENT_OVERRIDE ?? candidate;
  if (!resolved || !zEmail(resolved)) {
    throw new NotificationError('Geçerli bildirim alıcısı bulunamadı.', 'missing_recipient', false);
  }
  return resolved.toLowerCase();
}

function zEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
