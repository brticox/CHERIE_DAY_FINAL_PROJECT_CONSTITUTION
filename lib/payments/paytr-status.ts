import 'server-only';

import { createPaytrStatusQueryToken, type PaytrCredentials } from './paytr-crypto';

export type PaytrStatusEvidence = {
  merchantOrderId: string;
  paymentAmount: string;
  paymentTotal: string;
  currency: string;
  returns: unknown[];
};

export async function queryPaytrStatus(
  credentials: PaytrCredentials,
  merchantOrderId: string,
  transport: typeof fetch = fetch,
): Promise<PaytrStatusEvidence> {
  if (!/^[A-Za-z0-9]{1,64}$/.test(merchantOrderId)) {
    throw new Error('PAYTR_MERCHANT_ORDER_ID_INVALID');
  }
  const response = await transport('https://www.paytr.com/odeme/durum-sorgu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      merchant_id: credentials.merchantId,
      merchant_oid: merchantOrderId,
      paytr_token: createPaytrStatusQueryToken(credentials, merchantOrderId),
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!response.ok || data?.status !== 'success')
    throw new Error('PAYTR_STATUS_QUERY_FAILED');
  return {
    merchantOrderId,
    paymentAmount: String(data.payment_amount ?? ''),
    paymentTotal: String(data.payment_total ?? ''),
    currency: String(data.currency ?? ''),
    returns: Array.isArray(data.returns) ? data.returns : [],
  };
}
