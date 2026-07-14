import { NextResponse } from 'next/server';

import { paymentTelemetry } from '@/lib/payments/telemetry';
import { authorizeInternalRequest } from '@/lib/security/internal-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!authorizeInternalRequest(request.headers.get('authorization')))
    return NextResponse.json({ ok: false, code: 'unauthorized' }, { status: 401 });
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('detect_payment_discrepancies', {
    p_batch_size: 100,
    p_pending_age_minutes: 45,
  });
  if (error) {
    paymentTelemetry('rpc_failure', { code: error.code }, 'error');
    return NextResponse.json(
      { ok: false, code: 'reconciliation_unavailable' },
      { status: 503 },
    );
  }
  if (Number(data) > 0)
    paymentTelemetry('reconciliation_discrepancy', { count: Number(data) }, 'warning');
  return NextResponse.json(
    { ok: true, checked: true, records: Number(data) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
