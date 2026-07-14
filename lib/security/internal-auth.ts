import { timingSafeEqual } from 'node:crypto';

export function authorizeInternalRequest(header: string | null) {
  const secret =
    process.env.PAYMENT_WORKER_SECRET ??
    process.env.INTERNAL_CRON_SECRET ??
    process.env.CRON_SECRET;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!secret || !token) return false;
  const expected = Buffer.from(secret);
  const actual = Buffer.from(token);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
