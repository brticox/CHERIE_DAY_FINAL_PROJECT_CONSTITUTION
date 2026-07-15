import 'server-only';

import { getNotificationConfig } from '../config';
import type { EmailTransport } from '../types';
import { CaptureTransport } from './capture';
import { ResendTransport } from './resend';

export function getEmailTransport(): EmailTransport {
  const config = getNotificationConfig();
  if (!config.NOTIFICATION_SEND_ENABLED) return new CaptureTransport();
  return new ResendTransport(
    config.RESEND_API_KEY!,
    `${config.NOTIFICATION_FROM_NAME} <${config.NOTIFICATION_FROM_EMAIL}>`,
    config.NOTIFICATION_REPLY_TO_EMAIL,
  );
}
