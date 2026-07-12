import { NextResponse } from 'next/server';

import { intakeSchema } from '@/lib/validation/intake';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS = { 'Cache-Control': 'no-store' } as const;

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: RESPONSE_HEADERS });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 32_000) {
    return json(
      {
        ok: false,
        code: 'payload_too_large',
        message: 'Gönderiniz izin verilen boyutu aşıyor.',
      },
      413,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        code: 'invalid_json',
        message: 'Form verileri okunamadı. Lütfen tekrar deneyin.',
      },
      400,
    );
  }

  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        code: 'validation_error',
        message: 'Lütfen işaretli alanları kontrol edin.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  // Honeypot submissions receive a neutral success response but are never stored.
  if (parsed.data.company) {
    return json(
      { ok: true, code: 'accepted', message: 'Talebiniz alındı. Teşekkür ederiz.' },
      200,
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return json(
      {
        ok: false,
        code: 'service_unavailable',
        message:
          'Talep sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      },
      503,
    );
  }

  const data = parsed.data;
  const metadata = {
    inquiry_type: data.inquiryType,
    preferred_date: data.preferredDate,
    preferred_time: data.preferredTime,
    preferred_channel: data.preferredChannel,
    mood: data.mood,
    collection: data.collection,
    source_path: data.sourcePath,
  };

  try {
    const response = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/submit_public_intake`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_intake_type: data.intakeType,
          p_name: data.name,
          p_email: data.email ?? null,
          p_phone: data.phone ?? null,
          p_event_type: data.eventType ?? null,
          p_event_date_or_season: data.eventDateOrSeason ?? null,
          p_location: data.location ?? null,
          p_guest_count_band: data.guestCountBand ?? null,
          p_style_notes: data.styleNotes ?? null,
          p_budget_band: data.budgetBand ?? null,
          p_message: data.message ?? null,
          p_needed_modules: data.neededModules,
          p_source_entity_type: data.sourceEntityType ?? null,
          p_source_slug: data.sourceSlug ?? null,
          p_source_label: data.sourceLabel ?? null,
          p_consent: data.consent,
          p_metadata: metadata,
        }),
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return json(
        {
          ok: false,
          code: 'storage_error',
          message: 'Talebiniz kaydedilemedi. Lütfen biraz sonra tekrar deneyin.',
        },
        502,
      );
    }

    return json(
      {
        ok: true,
        code: 'created',
        message: 'Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.',
      },
      201,
    );
  } catch {
    return json(
      {
        ok: false,
        code: 'storage_unreachable',
        message: 'Şu an bağlantı kuramıyoruz. Lütfen biraz sonra tekrar deneyin.',
      },
      503,
    );
  }
}
