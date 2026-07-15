import { createHash, randomUUID } from 'node:crypto';

import {
  parsePaytrCallbackBody,
  PaytrCallbackError,
} from '@/lib/payments/paytr-callback';
import { verifyPaytrCallback } from '@/lib/payments/paytr';
import { paymentTelemetry } from '@/lib/payments/telemetry';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function response(message: string, status = 200) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(request: Request) {
  const correlationId = randomUUID();
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 65_536) {
    paymentTelemetry(
      'callback_rejected',
      { correlation_id: correlationId, code: 'PAYLOAD_TOO_LARGE' },
      'warning',
    );
    return response('FAILED', 413);
  }
  if (!providerConfigured()) return response('FAILED', 503);

  let callback;
  try {
    callback = parsePaytrCallbackBody(
      request.headers.get('content-type'),
      await request.text(),
    );
  } catch (error) {
    const status = error instanceof PaytrCallbackError ? error.httpStatus : 400;
    paymentTelemetry(
      'callback_rejected',
      {
        correlation_id: correlationId,
        code: error instanceof Error ? error.message : 'BAD_REQUEST',
      },
      'warning',
    );
    return response('FAILED', status);
  }

  paymentTelemetry('callback_received', {
    correlation_id: correlationId,
    merchant_order_id: callback.merchantOrderId,
    status: callback.status,
  });
  if (
    !verifyPaytrCallback({
      merchantOrderId: callback.merchantOrderId,
      status: callback.status,
      totalAmount: callback.totalAmount,
      hash: callback.hash,
    })
  ) {
    paymentTelemetry(
      'callback_rejected',
      { correlation_id: correlationId, code: 'BAD_SIGNATURE' },
      'warning',
    );
    return response('FAILED', 400);
  }

  const admin = createAdminClient();
  const identityHash = createHash('sha256')
    .update(`paytr:${callback.merchantOrderId}`)
    .digest('hex');
  const { data: allowed } = await admin.rpc('check_payment_rate_limit', {
    p_route_key: 'paytr_callback',
    p_identity_hash: identityHash,
    p_limit: 1000,
    p_window_seconds: 60,
  });
  if (allowed === false) {
    paymentTelemetry(
      'callback_rejected',
      { correlation_id: correlationId, code: 'RATE_LIMITED' },
      'warning',
    );
    return response('FAILED', 429);
  }

  const providerEventId = createHash('sha256')
    .update(
      [
        callback.merchantOrderId,
        callback.status,
        callback.totalAmountMinor,
        callback.paymentAmountMinor,
        callback.currency,
      ].join(':'),
    )
    .digest('hex');
  const { data, error } = await admin.rpc('ingest_paytr_callback', {
    p_merchant_order_id: callback.merchantOrderId,
    p_provider_event_id: providerEventId,
    p_status: callback.status,
    p_total_amount_minor: callback.totalAmountMinor,
    p_payment_amount_minor: callback.paymentAmountMinor,
    p_currency: callback.currency,
    p_payload: callback.safePayload,
    p_correlation_id: correlationId,
  });
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    paymentTelemetry(
      'rpc_failure',
      { correlation_id: correlationId, code: error?.code ?? 'NO_RESULT' },
      'error',
    );
    return response('FAILED', 500);
  }
  const result = data as Json & { outcome?: string; acknowledge?: boolean };
  if (result.outcome === 'duplicate') {
    paymentTelemetry('callback_duplicate', { correlation_id: correlationId });
  } else if (result.outcome === 'applied') {
    paymentTelemetry('callback_applied', {
      correlation_id: correlationId,
      status: callback.status,
    });
  } else {
    paymentTelemetry(
      'callback_discrepancy',
      { correlation_id: correlationId, outcome: result.outcome ?? 'unknown' },
      'error',
    );
  }
  return result.acknowledge === true ? response('OK') : response('FAILED', 409);
}

function providerConfigured() {
  return Boolean(
    process.env.PAYTR_MERCHANT_ID &&
    process.env.PAYTR_MERCHANT_KEY &&
    process.env.PAYTR_MERCHANT_SALT &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}
