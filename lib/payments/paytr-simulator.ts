import 'server-only';

import { createPaytrCallbackHash, type PaytrCredentials } from './paytr-crypto';

export type PaytrSimulatorScenario =
  | 'success'
  | 'failure'
  | 'invalid_signature'
  | 'wrong_amount'
  | 'wrong_currency'
  | 'unknown_order'
  | 'missing_fields'
  | 'malformed'
  | 'oversized';

export function simulatePaytrCallback(input: {
  credentials: PaytrCredentials;
  scenario: PaytrSimulatorScenario;
  merchantOrderId: string;
  paymentAmountMinor: number;
  totalAmountMinor?: number;
}) {
  const scenarioOrderId =
    input.scenario === 'unknown_order' ? 'UNKNOWNORDERA1' : input.merchantOrderId;
  const status = input.scenario === 'failure' ? 'failed' : 'success';
  const totalAmount = String(input.totalAmountMinor ?? input.paymentAmountMinor);
  const hash = createPaytrCallbackHash(input.credentials, {
    merchantOrderId: scenarioOrderId,
    status,
    totalAmount,
  });
  const form = new URLSearchParams({
    merchant_oid: scenarioOrderId,
    status,
    total_amount: totalAmount,
    payment_amount: String(
      input.scenario === 'wrong_amount'
        ? input.paymentAmountMinor - 1
        : input.paymentAmountMinor,
    ),
    payment_type: 'card',
    currency: input.scenario === 'wrong_currency' ? 'USD' : 'TL',
    test_mode: '1',
    hash: input.scenario === 'invalid_signature' ? mutate(hash) : hash,
  });
  if (status === 'failed') {
    form.set('failed_reason_code', '0');
    form.set('failed_reason_msg', 'Simülasyon reddi');
  }
  if (input.scenario === 'missing_fields') form.delete('hash');
  if (input.scenario === 'malformed') form.append('status', 'failed');
  if (input.scenario === 'oversized') form.set('failed_reason_msg', 'x'.repeat(66_000));
  return form.toString();
}

export function assertPaytrSimulatorEnvironment(
  env: Readonly<Record<string, string | undefined>> = process.env,
) {
  if (env.APP_ENV === 'production' || env.NODE_ENV === 'production') {
    throw new Error('PAYTR_SIMULATOR_FORBIDDEN_IN_PRODUCTION');
  }
  if (!env.PAYTR_SIMULATOR_SECRET || env.PAYTR_SIMULATOR_SECRET.length < 16) {
    throw new Error('PAYTR_SIMULATOR_SECRET_REQUIRED');
  }
}

function mutate(value: string) {
  return `${value[0] === 'A' ? 'B' : 'A'}${value.slice(1)}`;
}
