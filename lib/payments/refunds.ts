import 'server-only';

import { minorToTryDecimal } from './money';
import { createPaytrRefundToken, type PaytrCredentials } from './paytr-crypto';

export type RefundSubmission = {
  succeeded: boolean;
  providerReference: string;
  errorCode?: string;
  retryable: boolean;
};

export interface RefundProvider {
  submit(input: {
    merchantOrderId: string;
    amountMinor: number;
    idempotencyKey: string;
  }): Promise<RefundSubmission>;
}

export class PaytrRefundProvider implements RefundProvider {
  constructor(
    private readonly credentials: PaytrCredentials,
    private readonly transport: typeof fetch = fetch,
    private readonly env: Readonly<Record<string, string | undefined>> = process.env,
  ) {}

  async submit(input: {
    merchantOrderId: string;
    amountMinor: number;
    idempotencyKey: string;
  }): Promise<RefundSubmission> {
    assertRefundEnvironment(this.env);
    const returnAmount = minorToTryDecimal(input.amountMinor);
    const body = new URLSearchParams({
      merchant_id: this.credentials.merchantId,
      merchant_oid: input.merchantOrderId,
      return_amount: returnAmount,
      paytr_token: createPaytrRefundToken(
        this.credentials,
        input.merchantOrderId,
        returnAmount,
      ),
      reference_no: input.idempotencyKey.replace(/[^A-Za-z0-9]/g, '').slice(0, 64),
    });
    try {
      const response = await this.transport('https://www.paytr.com/odeme/iade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(20_000),
      });
      const data = (await response.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (response.ok && data?.status === 'success') {
        return {
          succeeded: true,
          providerReference: String(data.reference_no ?? input.idempotencyKey),
          retryable: false,
        };
      }
      return {
        succeeded: false,
        providerReference: input.idempotencyKey,
        errorCode: safeCode(data?.err_no ?? `HTTP_${response.status}`),
        retryable: response.status === 429 || response.status >= 500,
      };
    } catch (error) {
      return {
        succeeded: false,
        providerReference: input.idempotencyKey,
        errorCode:
          error instanceof DOMException && error.name === 'TimeoutError'
            ? 'PROVIDER_TIMEOUT'
            : 'PROVIDER_UNAVAILABLE',
        retryable: true,
      };
    }
  }
}

export class SimulatedRefundProvider implements RefundProvider {
  constructor(private readonly outcome: 'success' | 'failure' | 'timeout' = 'success') {}

  async submit(input: {
    merchantOrderId: string;
    amountMinor: number;
    idempotencyKey: string;
  }): Promise<RefundSubmission> {
    minorToTryDecimal(input.amountMinor);
    if (this.outcome === 'timeout') {
      return {
        succeeded: false,
        providerReference: input.idempotencyKey,
        errorCode: 'PROVIDER_TIMEOUT',
        retryable: true,
      };
    }
    if (this.outcome === 'failure') {
      return {
        succeeded: false,
        providerReference: input.idempotencyKey,
        errorCode: 'SIMULATED_DECLINE',
        retryable: false,
      };
    }
    return {
      succeeded: true,
      providerReference: `SIM${input.idempotencyKey.replace(/[^A-Za-z0-9]/g, '').slice(0, 40)}`,
      retryable: false,
    };
  }
}

function assertRefundEnvironment(env: Readonly<Record<string, string | undefined>>) {
  if (env.PAYTR_REFUND_ENABLED !== 'true') throw new Error('PAYTR_REFUND_DISABLED');
  if (env.PAYTR_TEST_MODE !== '1') throw new Error('PAYTR_REFUND_REQUIRES_SANDBOX');
  if (env.APP_ENV === 'production' || env.NODE_ENV === 'production') {
    throw new Error('PAYTR_REFUND_PRODUCTION_NOT_AUTHORIZED');
  }
}

function safeCode(value: unknown) {
  const code = String(value)
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 80);
  return code || 'PROVIDER_ERROR';
}
