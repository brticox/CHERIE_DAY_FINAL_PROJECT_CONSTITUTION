import type {
  PriceBand,
  ProductBehavior,
  ServiceBehavior,
  ServicePackage,
} from '@/lib/data/types';

const TRY = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
});

const TRY_MINOR = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatTRY(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined) return null;
  return TRY.format(amount);
}

export function formatTRYMinor(
  amountMinor: number | bigint | null | undefined,
): string | null {
  if (amountMinor === null || amountMinor === undefined) return null;
  return TRY_MINOR.format(Number(amountMinor) / 100);
}

/** Turkish behavior badge for products (docs/26, docs/44). */
export function productBehaviorBadge(behavior: ProductBehavior): string {
  switch (behavior) {
    case 'cart_enabled':
      return 'İncele';
    case 'proof_required_cart':
      return 'Tasarım Onaylı';
    case 'digital_checkout':
      return 'Dijital';
    case 'quote_required':
      return 'Teklif ile';
    case 'reservation_request':
      return 'Rezervasyonla';
    case 'city_dependent_service':
      return 'Şehre Bağlı';
    case 'inquiry_only':
      return 'Randevu ile';
  }
}

/** Primary CTA label per behavior (docs/39 §5). Placeholder — no cart yet. */
export function productPrimaryCta(behavior: ProductBehavior): string {
  switch (behavior) {
    case 'cart_enabled':
      return 'Sepete Ekle';
    case 'proof_required_cart':
      return 'Tasarımı Başlat';
    case 'digital_checkout':
      return 'Dijital Davetiye Oluştur';
    case 'quote_required':
      return 'Teklif Al';
    case 'reservation_request':
      return 'Rezervasyon Başlat';
    case 'city_dependent_service':
      return 'Şehrimde Hizmet Var mı?';
    case 'inquiry_only':
      return 'Tasarım İçin Görüşelim';
  }
}

export function serviceBehaviorBadge(behavior: ServiceBehavior): string {
  switch (behavior) {
    case 'quote_required':
      return 'Teklif ile';
    case 'reservation_request':
      return 'Rezervasyonla';
    case 'city_dependent_service':
      return 'Şehre Bağlı';
    case 'inquiry_only':
      return 'Danışmanlıkla';
  }
}

export function servicePrimaryCta(behavior: ServiceBehavior): string {
  switch (behavior) {
    case 'reservation_request':
      return 'Randevu İste';
    case 'quote_required':
      return 'Teklif Al';
    case 'city_dependent_service':
      return 'Şehrimde Hizmet Var mı?';
    case 'inquiry_only':
      return 'Bu Konsepti Konuşalım';
  }
}

const BAND_LABELS: Record<PriceBand, string> = {
  inquiry_only: 'Teklif ile',
  starter: 'Giriş seviyesi',
  premium: 'Premium',
  luxury: 'Lüks',
  bespoke: 'Bespoke',
};

export function priceBandLabel(band: PriceBand | null): string | null {
  return band ? BAND_LABELS[band] : null;
}

/** How to present a service package's price (docs/41 price_display). */
export function servicePriceLabel(pkg: ServicePackage): string {
  if (pkg.price_display === 'from_price' && pkg.base_from_price) {
    return `${formatTRY(pkg.base_from_price)}’den başlayan`;
  }
  if (pkg.price_display === 'price_band') {
    return priceBandLabel(pkg.price_band) ?? 'Teklif ile';
  }
  return 'Teklif ile';
}

export function productionTimeLabel(days: number | null): string | null {
  if (!days) return null;
  return `Üretim: ${days} iş günü`;
}
