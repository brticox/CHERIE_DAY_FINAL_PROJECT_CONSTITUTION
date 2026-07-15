import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { authorizeInternalRequest } from '@/lib/security/internal-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.APP_ENV !== 'staging') return new NextResponse(null, { status: 404 });
  if (!authorizeInternalRequest(request.headers.get('authorization'))) {
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
  }

  const eventId = Sentry.captureException(new Error('CHERIE_DAY_STAGING_SENTRY_SMOKE'), {
    tags: { check: 'phase-3-5', surface: 'server' },
    extra: {
      authorization: 'must-not-leave-app',
      email: 'must-not-leave-app@example.invalid',
      result: 'safe-staging-smoke',
    },
  });
  const flushed = await Sentry.flush(2_000);

  return NextResponse.json(
    { ok: true, eventId, flushed },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
