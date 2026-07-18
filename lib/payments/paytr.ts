import 'server-only';

import { minorToTryDecimal } from './money';
import {
  createPaytrToken,
  encodePaytrBasket,
  verifyPaytrCallbackHash,
} from './paytr-crypto';

type PaytrItem = { name: string; unitPriceMinor: number; quantity: number };

export type PaytrInitializeInput = {
  orderNumber: string;
  merchantOrderId: string;
  amountMinor: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  userIp: string;
  items: PaytrItem[];
};

export type PaytrInitializeResult = {
  merchantOrderId: string;
  token: string;
  paymentUrl: string;
};

export function paytrCredentials() {
  const merchantId = process.env.PAYTR_MERCHANT_ID;
  const merchantKey = process.env.PAYTR_MERCHANT_KEY;
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error('PAYTR_NOT_CONFIGURED');
  }
  return { merchantId, merchantKey, merchantSalt };
}

export async function initializePaytr(
  input: PaytrInitializeInput,
): Promise<PaytrInitializeResult> {
  const paytrCredentialsValue = paytrCredentials();
  const { merchantId } = paytrCredentialsValue;
  const merchantOrderId = input.merchantOrderId;
  if (!/^[a-zA-Z0-9]{1,64}$/.test(merchantOrderId)) {
    throw new Error('PAYTR_MERCHANT_ORDER_ID_INVALID');
  }
  const paymentAmountMinor = input.amountMinor;
  minorToTryDecimal(paymentAmountMinor);
  const paymentAmount = String(paymentAmountMinor);
  const currency = 'TL';
  const testMode = process.env.PAYTR_TEST_MODE === '0' ? '0' : '1';
  const noInstallment = '0';
  const maxInstallment = process.env.PAYTR_MAX_INSTALLMENT ?? '0';
  const basket = encodePaytrBasket(
    input.items.map((item) => ({
      name: item.name,
      unitPriceDecimal: minorToTryDecimal(item.unitPriceMinor),
      quantity: item.quantity,
    })),
  );
  const paytrToken = createPaytrToken(paytrCredentialsValue, {
    userIp: input.userIp,
    merchantOrderId,
    email: input.email,
    paymentAmountMinor,
    basketBase64: basket,
    noInstallment,
    maxInstallment,
    currency,
    testMode,
  });
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const form = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: input.userIp,
    merchant_oid: merchantOrderId,
    email: input.email,
    payment_amount: paymentAmount,
    paytr_token: paytrToken,
    user_basket: basket,
    debug_on: testMode,
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: input.fullName.slice(0, 60),
    user_address: input.address.slice(0, 400),
    user_phone: input.phone.slice(0, 20),
    merchant_ok_url: `${siteUrl}/odeme/basarili?order=${encodeURIComponent(input.orderNumber)}`,
    merchant_fail_url: `${siteUrl}/odeme/basarisiz?order=${encodeURIComponent(input.orderNumber)}`,
    timeout_limit: '30',
    currency,
    test_mode: testMode,
    lang: 'tr',
  });
  const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const result = (await response.json().catch(() => null)) as {
    status?: string;
    token?: string;
    reason?: string;
  } | null;
  if (!response.ok || result?.status !== 'success' || !result.token) {
    throw new Error(
      result?.reason ? `PAYTR_INIT_FAILED:${result.reason}` : 'PAYTR_INIT_FAILED',
    );
  }
  return {
    merchantOrderId,
    token: result.token,
    paymentUrl: `https://www.paytr.com/odeme/guvenli/${encodeURIComponent(result.token)}`,
  };
}

export function verifyPaytrCallback(input: {
  merchantOrderId: string;
  status: string;
  totalAmount: string;
  hash: string;
}) {
  return verifyPaytrCallbackHash(paytrCredentials(), input);
}
