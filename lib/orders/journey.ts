import type { Database } from '@/lib/supabase/database.types';

export type OrderStatus = Database['public']['Enums']['order_status'];

export type JourneyStageKey =
  | 'payment'
  | 'design'
  | 'proof'
  | 'production'
  | 'quality'
  | 'packaging'
  | 'shipping'
  | 'delivery';

export type StageState = 'complete' | 'current' | 'upcoming' | 'halted';

export type JourneyStage = {
  key: JourneyStageKey;
  /** Short label used in the horizontal stepper. */
  label: string;
  /** Full title used in the vertical/expanded timeline. */
  title: string;
  /** One calm sentence describing what happens during this stage. */
  hint: string;
};

export type JourneyStageView = JourneyStage & {
  index: number;
  state: StageState;
};

export type OrderJourney = {
  stages: JourneyStageView[];
  currentIndex: number;
  isTerminal: boolean;
  terminal: 'cancelled' | 'refunded' | null;
};

/**
 * The customer-facing milestone pipeline. This is derived exclusively from the
 * canonical `order_status` enum — it never reads internal operational tables
 * (production_jobs, quality_checks), so nothing operational leaks and the model
 * stays privacy-safe while still telling the full production truth.
 */
export const ORDER_JOURNEY_STAGES: JourneyStage[] = [
  { key: 'payment', label: 'Ödeme', title: 'Ödeme', hint: 'Ödemeniz güvenle doğrulanıyor.' },
  { key: 'design', label: 'Tasarım', title: 'Tasarım', hint: 'Ekibimiz tasarımınızı hazırlıyor.' },
  { key: 'proof', label: 'Prova', title: 'Prova onayı', hint: 'Tasarımı sizinle birlikte onaylıyoruz.' },
  { key: 'production', label: 'Üretim', title: 'Üretim', hint: 'Onaylı tasarımınız üretiliyor.' },
  { key: 'quality', label: 'Kalite', title: 'Kalite kontrolü', hint: 'Her ayrıntı tek tek inceleniyor.' },
  { key: 'packaging', label: 'Paketleme', title: 'Paketleme', hint: 'Siparişiniz özenle paketleniyor.' },
  { key: 'shipping', label: 'Kargo', title: 'Kargo', hint: 'Siparişiniz size doğru yolda.' },
  { key: 'delivery', label: 'Teslim', title: 'Teslim', hint: 'Siparişiniz elinize ulaştı.' },
];

/**
 * Progress position of each status along the 8-stage axis. Stage `i` occupies
 * the half-open interval [i, i+1): a value inside the interval means the stage
 * is *current*; a value at or beyond `i+1` means the stage is *complete*.
 * Boundary values (e.g. `paid` = 1) intentionally mark the previous stage done
 * and the next one as awaited.
 */
const STATUS_PROGRESS: Record<OrderStatus, number> = {
  pending_payment: 0.5,
  paid: 1,
  in_design: 1.5,
  proof_sent: 2.5,
  revision_requested: 2.5,
  proof_approved: 3,
  in_production: 3.5,
  quality_check: 4.5,
  packed: 5.5,
  shipped: 6.5,
  delivered: 7.5,
  completed: 8,
  cancelled: 0,
  refunded: 0,
};

export function orderJourney(status: OrderStatus): OrderJourney {
  const terminal =
    status === 'cancelled' ? 'cancelled' : status === 'refunded' ? 'refunded' : null;
  const progress = STATUS_PROGRESS[status] ?? 0;

  const stages = ORDER_JOURNEY_STAGES.map((stage, index): JourneyStageView => {
    let state: StageState;
    if (terminal) {
      state = progress >= index + 1 ? 'complete' : 'halted';
    } else if (progress >= index + 1) {
      state = 'complete';
    } else if (progress >= index) {
      state = 'current';
    } else {
      state = 'upcoming';
    }
    return { ...stage, index, state };
  });

  const currentIndex = terminal
    ? -1
    : Math.min(Math.floor(progress), ORDER_JOURNEY_STAGES.length - 1);

  return { stages, currentIndex, isTerminal: Boolean(terminal), terminal };
}

export type NextActionTone = 'action' | 'progress' | 'success' | 'halted';

export type NextAction = {
  tone: NextActionTone;
  kicker: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
};

/**
 * Derives the single, clear next thing for one order. `action` tone means the
 * customer must do something; every other tone is reassurance about progress we
 * are handling. Copy is direct and operational per the CHERIE DAY voice.
 */
export function orderNextAction(order: {
  status: OrderStatus;
  order_number: string;
}): NextAction {
  const base = `/hesap/siparisler/${encodeURIComponent(order.order_number)}`;

  switch (order.status) {
    case 'proof_sent':
      return {
        tone: 'action',
        kicker: 'Sıradaki adım',
        title: 'Provanız sizi bekliyor',
        description: 'Üretime geçebilmemiz için tasarımınızı incelemeniz yeterli.',
        cta: { label: 'Provayı görüntüleyin', href: `${base}#prova` },
      };
    case 'pending_payment':
      return {
        tone: 'action',
        kicker: 'Sıradaki adım',
        title: 'Ödemeniz doğrulanıyor',
        description: 'Ödemeniz onaylandığında tasarım süreciniz başlayacak.',
        cta: { label: 'Sipariş özetini açın', href: base },
      };
    case 'revision_requested':
      return {
        tone: 'progress',
        kicker: 'Sürüyor',
        title: 'Revizyon notunuz alındı',
        description:
          'Tasarım ekibimiz düzenlemenizi uyguluyor; hazır olduğunda sizi haberdar edeceğiz.',
      };
    case 'paid':
      return {
        tone: 'progress',
        kicker: 'Sürüyor',
        title: 'Siparişiniz onaylandı',
        description: 'Tasarım hazırlığınız için sıraya alındı.',
      };
    case 'in_design':
      return {
        tone: 'progress',
        kicker: 'Sürüyor',
        title: 'Tasarımınız hazırlanıyor',
        description: 'Provanız hazır olduğunda onayınız için sizi davet edeceğiz.',
      };
    case 'proof_approved':
      return {
        tone: 'progress',
        kicker: 'Sürüyor',
        title: 'Prova onaylandı',
        description: 'Üretim hazırlığınız başladı.',
      };
    case 'in_production':
      return {
        tone: 'progress',
        kicker: 'Sürüyor',
        title: 'Siparişiniz üretimde',
        description: 'Onaylı tasarımınız titizlikle üretiliyor.',
      };
    case 'quality_check':
      return {
        tone: 'progress',
        kicker: 'Sürüyor',
        title: 'Son kalite kontrolünde',
        description: 'Teslimattan önce her ayrıntıyı bir kez daha inceliyoruz.',
      };
    case 'packed':
      return {
        tone: 'progress',
        kicker: 'Sürüyor',
        title: 'Özenle paketlendi',
        description: 'Siparişiniz kargoya verilmek üzere hazır.',
      };
    case 'shipped':
      return {
        tone: 'progress',
        kicker: 'Yolda',
        title: 'Siparişiniz yola çıktı',
        description: 'Kargo bilgilerinizi sipariş sayfanızdan izleyebilirsiniz.',
        cta: { label: 'Teslimatı izleyin', href: `${base}#teslimat` },
      };
    case 'delivered':
    case 'completed':
      return {
        tone: 'success',
        kicker: 'Tamamlandı',
        title: 'Siparişiniz teslim edildi',
        description: 'Umarız beklediğiniz gibi olmuştur. Bir sonraki anınızda yine buradayız.',
        cta: { label: 'Siparişi görüntüleyin', href: base },
      };
    case 'cancelled':
      return {
        tone: 'halted',
        kicker: 'Kapandı',
        title: 'Siparişiniz iptal edildi',
        description: 'Bu sipariş için bir işlem beklenmiyor. Sorunuz olursa yanınızdayız.',
      };
    case 'refunded':
      return {
        tone: 'halted',
        kicker: 'Kapandı',
        title: 'İadeniz tamamlandı',
        description: 'Ödemeniz iade edildi. Destek ekibimiz her an ulaşılabilir.',
      };
    default:
      return {
        tone: 'progress',
        kicker: 'Durum',
        title: 'Siparişiniz işleniyor',
        description: 'Siparişinizin güncel durumunu sipariş sayfanızdan görebilirsiniz.',
        cta: { label: 'Siparişi görüntüleyin', href: base },
      };
  }
}

/**
 * Ranks how much the customer needs to see this order first on the Bugün home.
 * Orders awaiting a customer decision outrank everything.
 */
export function actionPriority(status: OrderStatus): number {
  switch (status) {
    case 'proof_sent':
      return 100;
    case 'pending_payment':
      return 90;
    case 'shipped':
      return 70;
    case 'revision_requested':
      return 60;
    case 'in_production':
    case 'quality_check':
    case 'packed':
      return 50;
    case 'paid':
    case 'in_design':
    case 'proof_approved':
      return 45;
    case 'delivered':
    case 'completed':
      return 20;
    case 'cancelled':
    case 'refunded':
      return 0;
    default:
      return 30;
  }
}

/** True when the order is waiting on the customer, not on us. */
export function isActionable(status: OrderStatus): boolean {
  return status === 'proof_sent' || status === 'pending_payment';
}

/** True while the order is still moving (not delivered/closed). */
export function isActiveOrder(status: OrderStatus): boolean {
  return (
    status !== 'delivered' &&
    status !== 'completed' &&
    status !== 'cancelled' &&
    status !== 'refunded'
  );
}
