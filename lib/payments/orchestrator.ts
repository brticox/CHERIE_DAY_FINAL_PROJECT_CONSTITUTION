import 'server-only';

import { createHash } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';
import type { OnlinePaymentProvider } from './index';
import { tryToMinor } from './money';
import { initializePaytr } from './paytr';

export type PaymentStartResult = {
  orderNumber: string;
  paymentId: string;
  paymentUrl: string;
};

export async function startPaymentAttempt(input: {
  checkoutSessionId: string;
  customerId: string;
  provider: OnlinePaymentProvider;
  email: string;
  userIp: string;
}): Promise<PaymentStartResult> {
  if (input.provider !== 'paytr') throw new Error('PAYMENT_PROVIDER_UNAVAILABLE');
  const admin = createAdminClient();
  const idempotencyKey = createHash('sha256')
    .update(`${input.customerId}:${input.checkoutSessionId}:${input.provider}`)
    .digest('hex');
  const { data: attempts, error: attemptError } = await admin.rpc(
    'create_payment_attempt_v2',
    {
      p_checkout_session_id: input.checkoutSessionId,
      p_customer_id: input.customerId,
      p_provider: input.provider,
      p_request_key: idempotencyKey,
    },
  );
  const attempt = Array.isArray(attempts) ? attempts[0] : attempts;
  if (attemptError || !attempt) throw new Error('PAYMENT_ATTEMPT_CREATE_FAILED');
  if (attempt.payment_status === 'paid' || attempt.payment_status === 'refunded') {
    throw new Error('PAYMENT_ALREADY_COMPLETED');
  }
  if (attempt.reused && attempt.provider_redirect_url) {
    return {
      orderNumber: String(attempt.order_number),
      paymentId: String(attempt.payment_id),
      paymentUrl: attempt.provider_redirect_url,
    };
  }

  const [{ data: order }, { data: items }] = await Promise.all([
    admin
      .from('orders')
      .select('order_number,total_amount,delivery_address_snapshot')
      .eq('id', attempt.order_id)
      .single(),
    admin
      .from('order_items')
      .select('product_snapshot,quantity,total_price')
      .eq('order_id', attempt.order_id),
  ]);
  if (!order || !items?.length) throw new Error('PAYMENT_ORDER_SNAPSHOT_MISSING');
  const address = (order.delivery_address_snapshot ?? {}) as Record<string, unknown>;
  const basketItems = items.map((item) => ({
    name: `${productName(item.product_snapshot)} × ${Number(item.quantity)}`,
    quantity: 1,
    unitPriceMinor: tryToMinor(String(item.total_price)),
  }));
  const basketSubtotalMinor = basketItems.reduce(
    (sum, item) => sum + item.unitPriceMinor,
    0,
  );
  if (basketSubtotalMinor > attempt.amount_minor) {
    throw new Error('PAYMENT_BASKET_AMOUNT_EXCEEDS_TOTAL');
  }
  if (basketSubtotalMinor < attempt.amount_minor) {
    basketItems.push({
      name: 'Teslimat ve sipariş hizmetleri',
      quantity: 1,
      unitPriceMinor: attempt.amount_minor - basketSubtotalMinor,
    });
  }

  try {
    const initialized = await initializePaytr({
      orderNumber: String(order.order_number),
      merchantOrderId: attempt.merchant_order_id,
      amountMinor: attempt.amount_minor,
      email: input.email,
      fullName: String(address.full_name ?? ''),
      phone: String(address.phone ?? ''),
      address: [
        address.address_line,
        address.neighborhood,
        address.district,
        address.city,
      ]
        .filter(Boolean)
        .join(', '),
      userIp: input.userIp,
      items: basketItems,
    });
    const { error: initializationError } = await admin.rpc(
      'record_payment_initialization',
      {
        p_payment_id: attempt.payment_id,
        p_succeeded: true,
        p_redirect_url: initialized.paymentUrl,
      },
    );
    if (initializationError) throw new Error('PAYMENT_INITIALIZATION_RECORD_FAILED');
    return {
      orderNumber: String(order.order_number),
      paymentId: String(attempt.payment_id),
      paymentUrl: initialized.paymentUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PAYMENT_INIT_FAILED';
    await admin.rpc('record_payment_initialization', {
      p_payment_id: attempt.payment_id,
      p_succeeded: false,
      p_error_code: message.split(':')[0],
    });
    throw error;
  }
}

function productName(snapshot: Json): string {
  if (
    snapshot &&
    !Array.isArray(snapshot) &&
    typeof snapshot === 'object' &&
    typeof snapshot.name === 'string'
  ) {
    return snapshot.name;
  }
  return 'CHERIE DAY ürünü';
}
