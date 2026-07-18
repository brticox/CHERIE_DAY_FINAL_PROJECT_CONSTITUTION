import { NextResponse } from 'next/server';

import { analyticsEventSchema } from '@/lib/analytics/events';
import {
  CONSENT_COOKIE_KEY,
  parseConsentPreference,
} from '@/lib/consent/preferences';
import { createAdminClient } from '@/lib/supabase/admin';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function consentCookie(request: Request) {
  const raw = request.headers.get('cookie') ?? '';
  const value = raw
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE_KEY}=`))
    ?.slice(CONSENT_COOKIE_KEY.length + 1);
  if (!value) return null;
  try {
    return parseConsentPreference(decodeURIComponent(value));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const consent = consentCookie(request);
  if (!consent?.categories.analytics) return new NextResponse(null, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const event = analyticsEventSchema.safeParse(body);
  if (!event.success) return new NextResponse(null, { status: 400 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse(null, { status: 503 });
  }

  const { error } = await createAdminClient().from('analytics_events').upsert(
    {
      id: event.data.id,
      session_ref: consent.sessionRef,
      event_name: event.data.eventName,
      route: event.data.route,
      entity_type: event.data.entityType ?? null,
      entity_id: event.data.entityId ?? null,
      properties: event.data.properties,
      consent_version: consent.version,
      occurred_at: event.data.occurredAt,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );
  return new NextResponse(null, { status: error ? 503 : 202 });
}
