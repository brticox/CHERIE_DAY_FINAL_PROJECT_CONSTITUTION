import { NextResponse } from 'next/server';

import { consentPreferenceSchema } from '@/lib/consent/preferences';
import {
  CONSENT_RECEIPT_COOKIE_KEY,
  readConsentReceipt,
} from '@/lib/consent/server-receipt';
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
  const db = createAdminClient();
  let sessionRef = readConsentReceipt(request.headers.get('cookie'));
  if (sessionRef) {
    const { data: existing, error: receiptError } = await db
      .from('cookie_consent_logs')
      .select('id')
      .eq('session_ref', sessionRef)
      .limit(1)
      .maybeSingle();
    if (receiptError) return NextResponse.json({ stored: false }, { status: 503 });
    if (!existing) sessionRef = null;
  }
  sessionRef ??= crypto.randomUUID();

  const { error } = await db.from('cookie_consent_logs').insert({
    session_ref: sessionRef,
    categories_json: parsed.data.categories,
    action: parsed.data.action,
    consent_version: parsed.data.version,
    ip,
  });
  if (error) return NextResponse.json({ stored: false }, { status: 503 });

  const response = NextResponse.json({ stored: true }, { status: 201 });
  response.cookies.set(CONSENT_RECEIPT_COOKIE_KEY, sessionRef, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
