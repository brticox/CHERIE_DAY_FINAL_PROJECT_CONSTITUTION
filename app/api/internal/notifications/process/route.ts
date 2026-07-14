import { timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { processNotificationBatch } from '@/lib/notifications/processor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!authorized(request.headers.get('authorization'))) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
  }
  try {
    const summary = await processNotificationBatch(20);
    return NextResponse.json({ ok: true, ...summary }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(
      { ok: false, code: 'worker_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

function authorized(header: string | null) {
  const secret = process.env.NOTIFICATION_WORKER_SECRET ?? process.env.INTERNAL_CRON_SECRET;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!secret || !token) return false;
  const left = Buffer.from(secret);
  const right = Buffer.from(token);
  return left.length === right.length && timingSafeEqual(left, right);
}
