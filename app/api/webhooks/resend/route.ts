import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { verifyResendWebhook } from '@/lib/notifications/resend-webhook';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret)
    return NextResponse.json({ error: 'Yapılandırma eksik.' }, { status: 503 });
  const payload = await request.text();
  if (Buffer.byteLength(payload) > 64 * 1024) {
    return NextResponse.json({ error: 'İstek çok büyük.' }, { status: 413 });
  }

  try {
    const event = verifyResendWebhook(
      payload,
      {
        id: request.headers.get('svix-id'),
        timestamp: request.headers.get('svix-timestamp'),
        signature: request.headers.get('svix-signature'),
      },
      secret,
    );
    const eventId = request.headers.get('svix-id')!;
    const admin = createAdminClient();
    const { error } = await admin.rpc('ingest_resend_delivery_event', {
      p_provider_event_id: eventId,
      p_provider_message_id: event.data.email_id,
      p_event_type: event.type,
      p_occurred_at: event.created_at,
    });
    if (error)
      return NextResponse.json({ error: 'Teslimat kaydı işlenemedi.' }, { status: 500 });
    return NextResponse.json({ accepted: true });
  } catch {
    return NextResponse.json({ error: 'Webhook doğrulanamadı.' }, { status: 400 });
  }
}
