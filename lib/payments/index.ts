/** Turkey-only, TRY-only normalized payment contract. */
export type PaymentProvider = 'iyzico' | 'paytr' | 'bank_transfer' | 'manual';

// Historical rows may contain other providers; new checkout is PayTR-only until
// another adapter has initialization, callback, refund, and reconciliation proof.
export type OnlinePaymentProvider = Extract<PaymentProvider, 'paytr'>;

export type NormalizedPaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PayableType =
  'order' | 'reservation_deposit' | 'reservation_balance' | 'quote';

export interface NormalizedPayment {
  provider: PaymentProvider;
  providerPaymentId: string | null;
  providerConversationId: string | null;
  status: NormalizedPaymentStatus;
  amount: number;
  currency: 'TRY';
  installmentCount: number;
  maskedCard: string | null;
  cardFamily: string | null;
}

export type ProviderReadiness = {
  provider: OnlinePaymentProvider;
  configured: boolean;
  label: string;
  mode: 'sandbox' | 'live' | 'unavailable';
  reason?: string;
};

export function getPaymentProviderReadiness(): ProviderReadiness[] {
  return [paytrReadiness()];
}

export function isOnlineProvider(value: string): value is OnlinePaymentProvider {
  return value === 'paytr';
}
import { paytrReadiness } from './environment';
