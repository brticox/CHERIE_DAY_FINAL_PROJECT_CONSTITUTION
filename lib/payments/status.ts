import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type CustomerPaymentResult = {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  provider: string | null;
  totalAmount: number;
  createdAt: string;
};

export async function getCustomerPaymentResult(
  orderNumber: string | undefined,
): Promise<CustomerPaymentResult | null> {
  if (
    !orderNumber ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    return null;
  }
  const session = await createClient();
  const { data: auth } = await session.auth.getUser();
  if (!auth.user) return null;
  const admin = createAdminClient();
  const { data: customer } = await admin
    .from('customers')
    .select('id')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle();
  if (!customer) return null;
  const { data: order } = await admin
    .from('orders')
    .select('id,order_number,status,payment_status,total_amount,created_at')
    .eq('order_number', orderNumber)
    .eq('customer_id', customer.id)
    .maybeSingle();
  if (!order) return null;
  const { data: payment } = await admin
    .from('payments')
    .select('provider,status')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    orderNumber: String(order.order_number),
    orderStatus: String(order.status),
    paymentStatus: String(payment?.status ?? order.payment_status),
    provider: payment?.provider ? String(payment.provider) : null,
    totalAmount: Number(order.total_amount),
    createdAt: String(order.created_at),
  };
}
