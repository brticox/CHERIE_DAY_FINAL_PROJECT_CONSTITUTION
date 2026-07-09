import type { ServiceCity, ServicePackage } from '@/lib/data/types';

export const servicePackages: ServicePackage[] = [
  {
    id: 'svc-dugun-organizasyonu', name: 'Düğün Organizasyonu', slug: 'dugun-organizasyonu',
    service_category: 'organizasyon', behavior_type: 'reservation_request', price_display: 'price_band',
    base_from_price: null, price_band: 'luxury', min_lead_time_days: 45, requires_event_date: true, requires_venue: true,
    summary: 'Bahçenizi, hayalinizin sahnesine çeviriyoruz.',
    description: 'Konseptten uygulamaya kadar düğününüzü tek bir estetik dilde kurar, gününüzü baştan sona koordine ederiz.',
  },
  {
    id: 'svc-nisan-soz', name: 'Nişan & Söz Organizasyonu', slug: 'nisan-soz-organizasyonu',
    service_category: 'nisan_soz_setup', behavior_type: 'reservation_request', price_display: 'price_band',
    base_from_price: null, price_band: 'premium', min_lead_time_days: 21, requires_event_date: true, requires_venue: true,
    summary: 'Sözünüz, kadife kadar nazik olsun.',
    description: 'Nişan ve söz kurulumunu tepsiden dekora kadar imzamızla hazırlar, sahneyi sizin için kurarız.',
  },
  {
    id: 'svc-dogum-gunu', name: 'Doğum Günü Konsepti', slug: 'dogum-gunu-konsepti',
    service_category: 'dogum_gunu', behavior_type: 'reservation_request', price_display: 'from_price',
    base_from_price: 6500, price_band: 'starter', min_lead_time_days: 14, requires_event_date: true, requires_venue: false,
    summary: 'Bir günü, tek bir hikâyeye dönüştürüyoruz.',
    description: 'Temalı doğum günü kurulumu; dekor, masa ve karşılama detaylarıyla.',
  },
  {
    id: 'svc-baby-shower', name: 'Baby Shower Konsepti', slug: 'baby-shower-konsepti',
    service_category: 'baby_shower', behavior_type: 'reservation_request', price_display: 'from_price',
    base_from_price: 7500, price_band: 'premium', min_lead_time_days: 14, requires_event_date: true, requires_venue: false,
    summary: 'İlk kutlama, en yumuşak tonlarla.',
    description: 'Baby shower kurulumu; renk paleti, masa ve hatıra köşesiyle birlikte.',
  },
  {
    id: 'svc-gender-reveal', name: 'Gender Reveal', slug: 'gender-reveal-konsepti',
    service_category: 'gender_reveal', behavior_type: 'reservation_request', price_display: 'from_price',
    base_from_price: 7500, price_band: 'premium', min_lead_time_days: 14, requires_event_date: true, requires_venue: false,
    summary: 'Bir sürprizin, en zarif açılışı.',
    description: 'Cinsiyet açıklama konsepti; sahne, dekor ve sürpriz anı kurgusuyla.',
  },
  {
    id: 'svc-dekor-konsept', name: 'Dekor & Konsept', slug: 'dekor-konsept',
    service_category: 'dekor_konsept', behavior_type: 'quote_required', price_display: 'quote_only',
    base_from_price: null, price_band: 'luxury', min_lead_time_days: 21, requires_event_date: true, requires_venue: true,
    summary: 'Backdrop, masa, karşılama — bir dünya kuruyoruz.',
    description: 'Fotoğraf köşesi, masa styling ve karşılama alanı için özel dekor tasarımı.',
  },
  {
    id: 'svc-muzik-dj', name: 'Müzik & DJ', slug: 'muzik-dj',
    service_category: 'muzik_dj', behavior_type: 'inquiry_only', price_display: 'quote_only',
    base_from_price: null, price_band: 'premium', min_lead_time_days: 14, requires_event_date: true, requires_venue: false,
    summary: 'Gecenin ritmi, doğru ellerde.',
    description: 'DJ ve canlı müzik seçenekleriyle etkinliğinizin akışını kuruyoruz.',
  },
  {
    id: 'svc-foto-video', name: 'Fotoğraf & Film', slug: 'foto-video',
    service_category: 'foto_video', behavior_type: 'quote_required', price_display: 'from_price',
    base_from_price: 18000, price_band: 'luxury', min_lead_time_days: 21, requires_event_date: true, requires_venue: false,
    summary: 'Gerçek bahçelerde, gerçek hikâyeler.',
    description: 'CHERIE DAY film ekibiyle fotoğraf, film ve kısa anlatı çekimleri.',
  },
];

export const serviceCities: ServiceCity[] = [
  { id: 'city-istanbul', city_name: 'İstanbul', city_slug: 'istanbul', travel_fee_model: 'none', notes_tr: 'Tüm hizmetler İstanbul’da sunulur.' },
  { id: 'city-ankara', city_name: 'Ankara', city_slug: 'ankara', travel_fee_model: 'fixed', notes_tr: 'Sabit ulaşım katkısıyla.' },
  { id: 'city-izmir', city_name: 'İzmir', city_slug: 'izmir', travel_fee_model: 'fixed', notes_tr: 'Sabit ulaşım katkısıyla.' },
  { id: 'city-bursa', city_name: 'Bursa', city_slug: 'bursa', travel_fee_model: 'quote', notes_tr: 'Ulaşım teklife göre belirlenir.' },
  { id: 'city-antalya', city_name: 'Antalya', city_slug: 'antalya', travel_fee_model: 'quote', notes_tr: 'Ulaşım teklife göre belirlenir.' },
];

/** Which package slugs are available in which city (seed availability). */
export const cityAvailability: Record<string, string[]> = {
  istanbul: servicePackages.map((s) => s.slug),
  ankara: ['dugun-organizasyonu', 'nisan-soz-organizasyonu', 'dekor-konsept', 'foto-video'],
  izmir: ['dugun-organizasyonu', 'nisan-soz-organizasyonu', 'dogum-gunu-konsepti', 'foto-video'],
  bursa: ['nisan-soz-organizasyonu', 'dekor-konsept'],
  antalya: ['dugun-organizasyonu', 'dekor-konsept', 'foto-video'],
};
