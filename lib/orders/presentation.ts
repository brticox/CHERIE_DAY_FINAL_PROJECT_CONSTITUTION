const ORDER_LABELS: Record<string, string> = {
  draft: 'Taslak',
  pending_payment: 'Ödeme bekleniyor',
  paid: 'Ödeme alındı',
  confirmed: 'Sipariş onaylandı',
  proof_pending: 'Tasarım hazırlanıyor',
  proof_sent: 'Tasarım onayınızı bekliyor',
  proof_revision_requested: 'Tasarım revize ediliyor',
  proof_approved: 'Tasarım onaylandı',
  in_production: 'Üretimde',
  quality_check: 'Kalite kontrolünde',
  ready_to_ship: 'Gönderime hazır',
  shipped: 'Kargoya verildi',
  delivered: 'Teslim edildi',
  cancelled: 'İptal edildi',
  refunded: 'İade edildi',
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Ödeme bekleniyor',
  authorized: 'Ödeme onaylandı',
  paid: 'Ödendi',
  failed: 'Ödeme başarısız',
  cancelled: 'Ödeme iptal edildi',
  refunded: 'İade edildi',
  partially_refunded: 'Kısmi iade',
};

// Fulfillment sub-statuses shown inside the order cockpit. Unknown values fall
// back to the raw string so nothing is ever hidden from the operator.
const PROOF_LABELS: Record<string, string> = {
  draft: 'Taslak',
  sent: 'Müşteriye gönderildi',
  revision_requested: 'Revizyon istendi',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

const PRODUCTION_LABELS: Record<string, string> = {
  ready: 'Hazır',
  in_production: 'Üretimde',
  blocked: 'Engellendi',
  quality_check: 'Kalite kontrolü',
  packed: 'Paketlendi',
  completed: 'Tamamlandı',
};

const SHIPMENT_LABELS: Record<string, string> = {
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  shipped: 'Kargoya verildi',
  in_transit: 'Yolda',
  delivered: 'Teslim edildi',
  returned: 'İade edildi',
  exception: 'Sorun bildirildi',
  cancelled: 'İptal edildi',
};

export function orderStatusLabel(status: string) {
  return ORDER_LABELS[status] ?? adminValueLabel(status);
}

export function paymentStatusLabel(status: string) {
  return PAYMENT_LABELS[status] ?? adminValueLabel(status);
}

export function proofStatusLabel(status: string) {
  return PROOF_LABELS[status] ?? adminValueLabel(status);
}

export function productionStatusLabel(status: string) {
  return PRODUCTION_LABELS[status] ?? adminValueLabel(status);
}

export function shipmentStatusLabel(status: string) {
  return SHIPMENT_LABELS[status] ?? adminValueLabel(status);
}

export function orderTone(status: string) {
  if (['delivered', 'paid', 'proof_approved'].includes(status)) return 'success';
  if (['cancelled', 'refunded', 'failed'].includes(status)) return 'error';
  return 'warning';
}
import { adminValueLabel } from '@/lib/admin/presentation';
