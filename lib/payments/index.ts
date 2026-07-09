/**
 * Payment provider abstraction (docs/24, docs/43 §8). Turkey-only, TRY-only.
 * Providers: iyzico (primary), paytr (fallback), bank_transfer, manual.
 *
 * Phase 1: types/structure only — no provider SDKs, no webhooks, no live calls.
 * Implementation lands in Phase 1 step 6 of docs/46 §3.
 */

export type PaymentProvider = 'iyzico' | 'paytr' | 'bank_transfer' | 'manual';

export type NormalizedPaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PayableType =
  | 'order'
  | 'reservation_deposit'
  | 'reservation_balance'
  | 'quote';

export interface NormalizedPayment {
  provider: PaymentProvider;
  providerPaymentId: string | null;
  providerConversationId: string | null;
  status: NormalizedPaymentStatus;
  amount: number; // TRY
  currency: 'TRY';
  installmentCount: number;
  maskedCard: string | null;
  cardFamily: string | null;
}
