'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect, useState } from 'react';

export function ClientTelemetrySmoke() {
  const [eventId, setEventId] = useState<string>();

  useEffect(() => {
    setEventId(
      Sentry.captureMessage('CHERIE_DAY_STAGING_SENTRY_CLIENT_SMOKE', {
        level: 'info',
        tags: { check: 'phase-3-5', surface: 'client' },
      }),
    );
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cherie-ivory px-6 text-center">
      <div>
        <h1 className="text-h2 text-cherie-ink">Staging istemci telemetri kontrolü</h1>
        <p className="mt-4 text-cherie-soft-ink" data-event-id={eventId}>
          {eventId ? 'Güvenli olay gönderildi.' : 'Güvenli olay gönderiliyor…'}
        </p>
      </div>
    </main>
  );
}
