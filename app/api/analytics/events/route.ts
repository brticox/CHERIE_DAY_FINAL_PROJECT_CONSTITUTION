import { NextResponse } from 'next/server';

import { analyticsEventSchema } from '@/lib/analytics/events';
import { CONSENT_VERSION } from '@/lib/consent/preferences';
import {
  hasAnalyticsConsentEvidence,
  readConsentReceipt,
} from '@/lib/consent/server-receipt';
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

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new NextResponse(null, { status: 403 });
  const sessionRef = readConsentReceipt(request.headers.get('cookie'));
  if (!sessionRef) return new NextResponse(null, { status: 403 });

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

  const db = createAdminClient();
  const { data: consent, error: consentError } = await db
    .from('cookie_consent_logs')
    .select('categories_json,consent_version')
    .eq('session_ref', sessionRef)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (consentError) return new NextResponse(null, { status: 503 });
  if (
    !consent ||
    !hasAnalyticsConsentEvidence({
      categories: consent.categories_json,
      version: consent.consent_version,
    })
  ) {
    return new NextResponse(null, { status: 403 });
  }

  const { error } = await db.from('analytics_events').upsert(
    {
      id: event.data.id,
      session_ref: sessionRef,
      event_name: event.data.eventName,
      route: event.data.route,
      entity_type: event.data.entityType ?? null,
      entity_id: event.data.entityId ?? null,
      properties: event.data.properties,
      consent_version: CONSENT_VERSION,
      occurred_at: event.data.occurredAt,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );
  return new NextResponse(null, { status: error ? 503 : 202 });
}
