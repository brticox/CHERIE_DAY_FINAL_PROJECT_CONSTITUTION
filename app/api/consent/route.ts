import { NextResponse } from 'next/server';

import { consentPreferenceSchema } from '@/lib/consent/preferences';
import { trustedClientIp } from '@/lib/security/client-ip';
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
  if (!sameOrigin(request)) {
    return NextResponse.json({ stored: false }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ stored: false }, { status: 400 });
  }
  const parsed = consentPreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ stored: false }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ stored: false }, { status: 503 });
  }

  let ip: string | null = null;
  try {
    ip = trustedClientIp(request.headers);
  } catch {
    ip = null;
  }
  const { error } = await createAdminClient().from('cookie_consent_logs').insert({
    session_ref: parsed.data.sessionRef,
    categories_json: parsed.data.categories,
    action: parsed.data.action,
    consent_version: parsed.data.version,
    ip,
  });
  return NextResponse.json(
    { stored: !error },
    { status: error ? 503 : 201 },
  );
}
