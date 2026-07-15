import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ClientTelemetrySmoke } from './client-event';

export const metadata: Metadata = {
  title: 'Staging Telemetry Check',
  robots: { index: false, follow: false },
};

export default function ClientTelemetrySmokePage() {
  if (process.env.APP_ENV !== 'staging') notFound();
  return <ClientTelemetrySmoke />;
}
