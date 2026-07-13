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

export function orderStatusLabel(status: string) {
  return ORDER_LABELS[status] ?? status;
}

export function paymentStatusLabel(status: string) {
  return PAYMENT_LABELS[status] ?? status;
}

export function orderTone(status: string) {
  if (['delivered', 'paid', 'proof_approved'].includes(status)) return 'success';
  if (['cancelled', 'refunded', 'failed'].includes(status)) return 'error';
  return 'warning';
}
