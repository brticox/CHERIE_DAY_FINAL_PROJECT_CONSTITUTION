import type { DigitalProduct } from '@/lib/data/types';

export const digitalProducts: DigitalProduct[] = [
  { id: 'dig-klasik', name_tr: 'Dijital Davetiye — Klasik', slug: 'dijital-davetiye-klasik', digital_type: 'dijital_davetiye', behavior: 'digital_checkout', base_price: 250, summary: 'Zarafet, ekranın içinde.' },
  { id: 'dig-animasyonlu', name_tr: 'Dijital Davetiye — Hareketli', slug: 'dijital-davetiye-animasyonlu', digital_type: 'animasyonlu_davetiye', behavior: 'proof_required', base_price: 450, summary: 'Sevginiz artık ışıkla da yazılır.' },
  { id: 'dig-web', name_tr: 'Web Davetiye — Tek Sayfa', slug: 'web-davetiye-tek-sayfa', digital_type: 'web_davetiye', behavior: 'proof_required', base_price: 900, summary: 'Bir bağlantı, koca bir davet.' },
  { id: 'dig-qr', name_tr: 'QR Davet Kartı', slug: 'qr-davet-karti', digital_type: 'qr_kart', behavior: 'digital_checkout', base_price: 150, summary: 'Küçük bir kare, koca bir davet.' },
  { id: 'dig-album', name_tr: 'Dijital Albüm', slug: 'dijital-album', digital_type: 'dijital_album', behavior: 'quote_required', base_price: null, summary: 'Anılarınız, tek bir bağlantıda.' },
  { id: 'dig-sablon', name_tr: 'İndirilebilir Davetiye Şablonu', slug: 'indirilebilir-davetiye-sablonu', digital_type: 'indirilebilir', behavior: 'digital_checkout', base_price: 120, summary: 'Kendiniz düzenleyin, hemen paylaşın.' },
];
