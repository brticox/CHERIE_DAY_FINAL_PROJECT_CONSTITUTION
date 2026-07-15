// Keyed on the canonical `order_status` enum. Every enum member MUST appear here
// so a real order never leaks a raw status string to the customer. Kept in sync
// with supabase enum order_status: pending_payment, paid, in_design, proof_sent,
// revision_requested, proof_approved, in_production, quality_check, packed,
// shipped, delivered, completed, cancelled, refunded.
const ORDER_LABELS: Record<string, string> = {
  pending_payment: 'Ödeme doğrulanıyor',
  paid: 'Ödeme alındı',
  in_design: 'Tasarım hazırlanıyor',
  proof_sent: 'Provanız hazır',
  revision_requested: 'Revizyon uygulanıyor',
  proof_approved: 'Prova onaylandı',
  in_production: 'Üretimde',
  quality_check: 'Son kalite kontrolünde',
  packed: 'Özenle paketlendi',
  shipped: 'Yola çıktı',
  delivered: 'Teslim edildi',
  completed: 'Tamamlandı',
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

// Returns a stable three-value tone consumed by status chips in both the admin
// and customer order lists. Accepts either an order_status or a payment_status.
export function orderTone(status: string) {
  if (['delivered', 'completed', 'paid', 'authorized', 'proof_approved'].includes(status)) {
    return 'success';
  }
  if (['cancelled', 'refunded', 'failed'].includes(status)) return 'error';
  return 'warning';
}
import { adminValueLabel } from '@/lib/admin/presentation';
