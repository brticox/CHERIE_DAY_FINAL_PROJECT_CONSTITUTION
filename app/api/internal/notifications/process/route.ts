import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { processNotificationBatch } from '@/lib/notifications/processor';
import { authorizeInternalRequest } from '@/lib/security/internal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleNotificationWorker(request: Request) {
  if (!authorizeInternalRequest(request.headers.get('authorization'), 'notification')) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
  }
  try {
    const summary = await processNotificationBatch(20);
    if (
      summary.health.due_count >= 100 ||
      summary.health.oldest_due_seconds >= 900 ||
      summary.health.permanently_failed_24h > 0
    ) {
      Sentry.captureMessage('Transactional notification backlog requires attention', {
        level: 'error',
        tags: { subsystem: 'notification-worker', trigger: 'cron', alert: 'backlog' },
        fingerprint: ['notification-outbox-backlog'],
        extra: summary.health,
      });
    }
    return NextResponse.json(
      { ok: true, ...summary },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    Sentry.captureException(error, {
      tags: { subsystem: 'notification-worker', trigger: 'cron' },
    });
    return NextResponse.json(
      { ok: false, code: 'worker_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

export const POST = handleNotificationWorker;
export const GET = handleNotificationWorker;
