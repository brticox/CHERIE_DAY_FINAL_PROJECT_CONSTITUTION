export type AdminTone = 'neutral' | 'information' | 'success' | 'warning' | 'danger';

const LABELS: Record<string, string> = {
  active: 'Aktif',
  approved: 'Onaylandı',
  archived: 'Arşivlendi',
  assigned: 'Atandı',
  authorized: 'Yetkilendirildi',
  blocked: 'Engellendi',
  cancelled: 'İptal edildi',
  completed: 'Tamamlandı',
  confirmed: 'Onaylandı',
  current: 'Güncel',
  delivered: 'Teslim edildi',
  draft: 'Taslak',
  exception: 'Sorun var',
  failed: 'Başarısız',
  in_design: 'Tasarımda',
  in_production: 'Üretimde',
  in_progress: 'Devam ediyor',
  in_transit: 'Yolda',
  inactive: 'Pasif',
  open: 'Açık',
  packed: 'Paketlendi',
  paid: 'Ödendi',
  partially_refunded: 'Kısmen iade edildi',
  passed: 'Kontrolden geçti',
  payment_pending: 'Ödeme bekleniyor',
  pending: 'Bekliyor',
  pending_payment: 'Ödeme bekleniyor',
  preparing: 'Hazırlanıyor',
  proof_approved: 'Tasarım onaylandı',
  proof_pending: 'Tasarım hazırlanıyor',
  proof_sent: 'Tasarım gönderildi',
  published: 'Yayında',
  quality_check: 'Kalite kontrolünde',
  ready: 'Hazır',
  attention: 'İnceleme gerekli',
  ready_to_ship: 'Gönderime hazır',
  refunded: 'İade edildi',
  rejected: 'Reddedildi',
  returned: 'İade geldi',
  revision_requested: 'Revizyon istendi',
  sent: 'Gönderildi',
  shipped: 'Kargoya verildi',
  closed: 'Kapalı',
  waiting_customer: 'Müşteri yanıtı bekleniyor',
  waiting_team: 'Ekip yanıtı bekleniyor',
  requested: 'Talep alındı',
  quote_pending: 'Teklif bekleniyor',
  deposit_paid: 'Depozito ödendi',
  in_planning: 'Planlamada',
  rescheduled: 'Yeniden planlandı',
  no_show: 'Katılım olmadı',
  deposit: 'Depozito',
  approval_step: 'Onay adımı',
  final_payment: 'Kalan ödeme',
  blackout: 'Rezervasyona kapalı',
  full: 'Kapasite dolu',
  available: 'Uygun',
  home: 'Ev',
  work: 'İş',
  billing: 'Fatura',
  shipping: 'Teslimat',
  unassigned: 'Atanmadı',
  unread: 'Okunmadı',
  cart_enabled: 'Doğrudan satış',
  proof_required_cart: 'Prova onaylı satış',
  digital_checkout: 'Dijital satış',
  quote_required: 'Teklif gerekli',
  inquiry_only: 'Bilgi talebi',
  reservation_request: 'Rezervasyon talebi',
  city_dependent_service: 'Şehre bağlı hizmet',
  in_stock: 'Stokta',
  made_to_order: 'Siparişe özel üretim',
  preorder: 'Ön sipariş',
  unavailable: 'Mevcut değil',
  email: 'E-posta',
  sms: 'SMS',
  whatsapp: 'WhatsApp',
  phone: 'Telefon',
  internal: 'Ekip içi',
  customer: 'Müşteri',
  staff: 'Ekip üyesi',
  manual: 'Manuel',
  system: 'Sistem',
  low: 'Düşük',
  normal: 'Normal',
  high: 'Yüksek',
  urgent: 'Acil',
  new: 'Yeni',
  contacted: 'İletişime geçildi',
  qualified: 'Nitelikli',
  appointment: 'Randevu',
  proposal_sent: 'Teklif gönderildi',
  negotiation: 'Müzakere',
  won: 'Kazanıldı',
  lost: 'Kaybedildi',
  quote: 'Teklif',
  hayalini_tasarla: 'Hayalini Tasarla',
  quote_request: 'Teklif talebi',
  product_inquiry: 'Ürün bilgi talebi',
  contact_form: 'İletişim formu',
  memory_request: 'Anı talebi',
  city_waitlist: 'Şehir bekleme listesi',
  callback: 'Sağlayıcı bildirimi',
  processed: 'İşlendi',
  processing: 'İşleniyor',
  queued: 'Kuyrukta',
  retry_scheduled: 'Yeniden denenecek',
  permanently_failed: 'Kalıcı hata',
  ignored: 'İşlem gerektirmiyor',
  unmatched: 'Eşleşmedi',
  bank_transfer: 'Banka transferi',
  paytr: 'PayTR',
  iyzico: 'Iyzico',
  organizasyon: 'Organizasyon',
  nisan_soz_setup: 'Nişan ve söz kurulumu',
  dogum_gunu: 'Doğum günü',
  baby_shower: 'Bebek kutlaması',
  gender_reveal: 'Cinsiyet öğrenme kutlaması',
  dekor_konsept: 'Dekor ve konsept',
  muzik_dj: 'Müzik ve DJ',
  foto_video: 'Fotoğraf ve video',
  sehir_hizmeti: 'Şehir hizmeti',
  ozel: 'Özel hizmet',
};
const EVENTS: Record<string, string> = {
  'customer.note.added': 'Müşteri notu eklendi',
  'customer.status.updated': 'Müşteri durumu güncellendi',
  'media.metadata.updated': 'Medya bilgileri güncellendi',
  'product.created': 'Ürün oluşturuldu',
  'product.duplicated': 'Ürün çoğaltıldı',
  'product.seo.updated': 'Arama görünümü güncellendi',
  'product.taxonomy.updated': 'Ürün sınıflandırması güncellendi',
  'product.updated': 'Ürün bilgileri güncellendi',
  'production.transitioned': 'Üretim aşaması değiştirildi',
  'production.updated': 'Üretim kaydı güncellendi',
  'proof.assignment.updated': 'Tasarım görevi güncellendi',
  'reservation.updated': 'Rezervasyon güncellendi',
  'settings.updated': 'Ayarlar güncellendi',
  'shipment.exception.recorded': 'Kargo sorunu kaydedildi',
  'shipment.transitioned': 'Kargo aşaması değiştirildi',
  'support.replied': 'Destek yanıtı gönderildi',
  'support.updated': 'Destek kaydı güncellendi',
};
const SUCCESS = new Set([
  'active',
  'approved',
  'authorized',
  'completed',
  'confirmed',
  'current',
  'delivered',
  'paid',
  'passed',
  'proof_approved',
  'published',
  'ready',
  'ready_to_ship',
  'sent',
  'shipped',
]);
const DANGER = new Set([
  'blocked',
  'cancelled',
  'exception',
  'failed',
  'rejected',
  'returned',
]);
const WARNING = new Set([
  'draft',
  'in_design',
  'in_production',
  'in_progress',
  'packed',
  'payment_pending',
  'pending',
  'pending_payment',
  'preparing',
  'proof_pending',
  'quality_check',
  'revision_requested',
  'unassigned',
  'unread',
]);
const INFORMATION = new Set(['archived', 'refunded', 'partially_refunded', 'in_transit']);
export function adminValueLabel(value: string | null | undefined) {
  if (!value) return 'Belirtilmedi';
  return LABELS[value] ?? 'Tanımlı durum';
}
export function adminEventLabel(value: string | null | undefined) {
  if (!value) return 'Sistem işlemi';
  return EVENTS[value] ?? 'Operasyon kaydı güncellendi';
}
export function adminValueTone(value: string | null | undefined): AdminTone {
  if (!value) return 'neutral';
  if (SUCCESS.has(value)) return 'success';
  if (DANGER.has(value)) return 'danger';
  if (WARNING.has(value)) return 'warning';
  if (INFORMATION.has(value)) return 'information';
  return 'neutral';
}
export function adminToneClass(tone: AdminTone) {
  switch (tone) {
    case 'success':
      return 'border-cherie-success/25 bg-cherie-success/10 text-cherie-success';
    case 'danger':
      return 'border-cherie-error/25 bg-cherie-error/10 text-cherie-error';
    case 'warning':
      return 'border-cherie-warning/25 bg-cherie-warning/10 text-cherie-warning';
    case 'information':
      return 'border-cherie-burgundy/20 bg-cherie-burgundy/5 text-cherie-burgundy';
    default:
      return 'border-cherie-lace bg-cherie-paper text-cherie-soft-ink';
  }
}
