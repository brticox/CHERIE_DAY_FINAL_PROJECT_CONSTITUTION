import 'server-only';

import { createHash } from 'node:crypto';

import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/database.types';
import type { OnlinePaymentProvider } from './index';
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
    'create_payment_attempt',
    {
      p_checkout_session_id: input.checkoutSessionId,
      p_customer_id: input.customerId,
      p_provider: input.provider,
      p_idempotency_key: idempotencyKey,
    },
  );
  const attempt = Array.isArray(attempts) ? attempts[0] : attempts;
  if (attemptError || !attempt) throw new Error('PAYMENT_ATTEMPT_CREATE_FAILED');

  const [{ data: order }, { data: items }] = await Promise.all([
    admin
      .from('orders')
      .select('order_number,total_amount,delivery_address_snapshot')
      .eq('id', attempt.order_id)
      .single(),
    admin
      .from('order_items')
      .select('product_snapshot,quantity,unit_price')
      .eq('order_id', attempt.order_id),
  ]);
  if (!order || !items?.length) throw new Error('PAYMENT_ORDER_SNAPSHOT_MISSING');
  const address = (order.delivery_address_snapshot ?? {}) as Record<string, unknown>;

  try {
    const initialized = await initializePaytr({
      orderNumber: String(order.order_number),
      amount: Number(order.total_amount),
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
      items: items.map((item) => ({
        name: productName(item.product_snapshot),
        quantity: Number(item.quantity),
        price: Number(item.unit_price),
      })),
    });
    await Promise.all([
      admin
        .from('payments')
        .update({ provider_conversation_id: initialized.merchantOrderId })
        .eq('id', attempt.payment_id),
      admin.from('payment_events').insert({
        payment_id: attempt.payment_id,
        provider: input.provider,
        provider_event_id: `init:${attempt.payment_id}`,
        event_type: 'checkout_initialized',
        payload: { merchant_order_id: initialized.merchantOrderId },
        signature_valid: true,
        processing_status: 'applied',
      }),
    ]);
    return {
      orderNumber: String(order.order_number),
      paymentId: String(attempt.payment_id),
      paymentUrl: initialized.paymentUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PAYMENT_INIT_FAILED';
    await admin
      .from('payments')
      .update({ status: 'failed', last_error_code: message.split(':')[0] })
      .eq('id', attempt.payment_id);
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
