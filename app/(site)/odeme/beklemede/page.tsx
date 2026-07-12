import type { Metadata } from 'next';

import { PaymentResult } from '@/components/checkout/payment-result';
import { getCustomerPaymentResult } from '@/lib/payments/status';

export const metadata: Metadata = {
  title: 'Ödeme Doğrulanıyor',
  robots: { index: false },
};
export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <PaymentResult result={await getCustomerPaymentResult(order)} expected="pending" />
  );
}
