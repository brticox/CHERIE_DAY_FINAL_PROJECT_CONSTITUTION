/** Turkey-only, TRY-only normalized payment contract. */
export type PaymentProvider = 'iyzico' | 'paytr' | 'bank_transfer' | 'manual';

export type OnlinePaymentProvider = Extract<PaymentProvider, 'iyzico' | 'paytr'>;

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
  const iyzicoCredentials = Boolean(
    process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY,
  );
  return [
    paytrReadiness(),
    {
      provider: 'iyzico',
      configured: false,
      label: 'iyzico',
      mode: 'unavailable',
      reason: iyzicoCredentials
        ? 'Kimlik/fatura politikası onaylandıktan sonra etkinleştirilecek.'
        : 'iyzico mağaza anahtarları bekleniyor.',
    },
  ];
}

export function isOnlineProvider(value: string): value is OnlinePaymentProvider {
  return value === 'iyzico' || value === 'paytr';
}
import { paytrReadiness } from './environment';
