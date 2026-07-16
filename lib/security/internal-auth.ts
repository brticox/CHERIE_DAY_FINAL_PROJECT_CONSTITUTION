import { timingSafeEqual } from 'node:crypto';

export type InternalRequestScope = 'notification' | 'payment' | 'telemetry';

export function authorizeInternalRequest(
  header: string | null,
  scope: InternalRequestScope,
) {
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return false;
  const scopedSecret =
    scope === 'notification'
      ? process.env.NOTIFICATION_WORKER_SECRET
      : scope === 'payment'
        ? process.env.PAYMENT_WORKER_SECRET
        : undefined;
  const candidates = [
    scopedSecret,
    process.env.INTERNAL_CRON_SECRET,
    process.env.CRON_SECRET,
  ].filter((value): value is string => Boolean(value));

  return candidates.some((secret) => timingSafeSecretEqual(secret, token));
}

function timingSafeSecretEqual(secret: string, token: string) {
  const expected = Buffer.from(secret);
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
