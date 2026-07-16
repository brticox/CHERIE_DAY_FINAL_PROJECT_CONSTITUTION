import type { NotificationCategory } from './types';

export type ReplyRoute = 'support' | 'orders' | 'payments' | 'hello' | 'legal';
export type NotificationOwner = ReplyRoute | 'platform';

export interface NotificationEventDefinition {
  eventKey: string;
  trigger: string;
  source: string;
  recipient: 'customer' | 'staff' | 'customer_and_staff';
  sender: 'hello';
  replyTo: ReplyRoute;
  classification: NotificationCategory | 'legal';
  templateKey: string;
  deduplicationKey: string;
  retryPolicy: 'transactional_bounded' | 'staff_critical' | 'marketing_separate';
  suppressionPolicy: 'never_for_security' | 'permanent_delivery_failure' | 'consent_and_delivery_failure';
  adminOwner: NotificationOwner;
  sentryEscalation: 'none' | 'permanent_failure' | 'immediate';
  requiredConsent: 'service_contract' | 'legal_obligation' | 'legitimate_interest' | 'marketing_opt_in';
  retention: 'identity_audit' | 'commerce_audit' | 'support_record' | 'marketing_consent';
  connection: 'connected' | 'implemented_not_yet_triggered' | 'provider_managed';
}

type Family = Omit<NotificationEventDefinition, 'eventKey' | 'templateKey'> & {
  templatePrefix: string;
};

function define(keys: readonly string[], family: Family): NotificationEventDefinition[] {
  return keys.map((eventKey) => ({
    ...family,
    eventKey,
    templateKey: `${family.templatePrefix}-${eventKey.split('.').slice(1).join('-')}`,
  }));
}

const auth = define(
  [
    'auth.registration_requested', 'auth.email_confirmation_sent', 'auth.email_confirmed',
    'auth.welcome', 'auth.password_reset_requested', 'auth.password_changed',
    'auth.email_change_requested', 'auth.email_changed', 'auth.login_new_device',
    'auth.login_security_alert', 'auth.account_disabled', 'auth.account_archived',
    'auth.account_reactivated', 'auth.support_needed',
  ],
  {
    trigger: 'Doğrulanmış kimlik yaşam döngüsü değişikliği',
    source: 'Supabase Auth / customer_identity_events',
    recipient: 'customer', sender: 'hello', replyTo: 'support', classification: 'security',
    templatePrefix: 'auth', deduplicationKey: '{event}:{auth_user_id}:{event_id}',
    retryPolicy: 'transactional_bounded', suppressionPolicy: 'never_for_security',
    adminOwner: 'support', sentryEscalation: 'permanent_failure',
    requiredConsent: 'legitimate_interest', retention: 'identity_audit',
    connection: 'provider_managed',
  },
);

const order = define(
  ['order.received', 'order.confirmed', 'order.awaiting_information', 'order.customization_received', 'order.updated', 'order.cancelled', 'order.completed'],
  {
    trigger: 'Atomik sipariş veya sipariş durumu işlemi', source: 'orders / order_status_events',
    recipient: 'customer', sender: 'hello', replyTo: 'orders', classification: 'transactional',
    templatePrefix: 'order', deduplicationKey: '{event}:{order_id}:{event_id}',
    retryPolicy: 'transactional_bounded', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'orders', sentryEscalation: 'permanent_failure', requiredConsent: 'service_contract',
    retention: 'commerce_audit', connection: 'connected',
  },
);

const payment = define(
  ['payment.pending', 'payment.authorized', 'payment.paid', 'payment.failed', 'payment.amount_mismatch', 'payment.review_required', 'payment.refund_requested', 'payment.refund_approved', 'payment.refund_processing', 'payment.refunded', 'payment.refund_failed', 'payment.reconciliation_discrepancy'],
  {
    trigger: 'İmzalı ödeme olayı veya denetlenmiş finans işlemi', source: 'payments / payment_events / refunds',
    recipient: 'customer_and_staff', sender: 'hello', replyTo: 'payments', classification: 'transactional',
    templatePrefix: 'payment', deduplicationKey: '{event}:{payment_id}:{provider_event_id}',
    retryPolicy: 'staff_critical', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'payments', sentryEscalation: 'immediate', requiredConsent: 'service_contract',
    retention: 'commerce_audit', connection: 'connected',
  },
);

const proof = define(
  ['proof.preparing', 'proof.ready', 'proof.sent', 'proof.reminder', 'proof.revision_requested', 'proof.updated', 'proof.approved', 'proof.approval_recorded'],
  {
    trigger: 'Denetlenmiş prova veya tasarım yaşam döngüsü işlemi', source: 'order_proofs / order_status_events',
    recipient: 'customer_and_staff', sender: 'hello', replyTo: 'orders', classification: 'transactional',
    templatePrefix: 'proof', deduplicationKey: '{event}:{proof_id}:{version}',
    retryPolicy: 'transactional_bounded', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'orders', sentryEscalation: 'permanent_failure', requiredConsent: 'service_contract',
    retention: 'commerce_audit', connection: 'connected',
  },
);

const fulfilment = define(
  ['production.started', 'production.milestone', 'quality.review', 'quality.issue', 'packaging.ready', 'shipment.label_created', 'shipment.dispatched', 'shipment.in_transit', 'shipment.delayed', 'shipment.delivered', 'shipment.delivery_problem'],
  {
    trigger: 'Denetlenmiş üretim veya teslimat durumu değişikliği', source: 'order_status_events / shipments',
    recipient: 'customer_and_staff', sender: 'hello', replyTo: 'orders', classification: 'transactional',
    templatePrefix: 'fulfilment', deduplicationKey: '{event}:{order_id}:{event_id}',
    retryPolicy: 'transactional_bounded', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'orders', sentryEscalation: 'permanent_failure', requiredConsent: 'service_contract',
    retention: 'commerce_audit', connection: 'connected',
  },
);

const service = define(
  ['contact.received', 'contact.acknowledged', 'quote.requested', 'quote.ready', 'quote.accepted', 'quote.expiring', 'appointment.requested', 'appointment.confirmed', 'appointment.reminder_24h', 'appointment.reminder_2h', 'appointment.rescheduled', 'appointment.cancelled', 'reservation.received', 'reservation.confirmed', 'reservation.updated', 'event.milestone_reminder', 'concierge.follow_up'],
  {
    trigger: 'Müşteri talebi veya denetlenmiş hizmet planı değişikliği', source: 'leads / appointments / reservations',
    recipient: 'customer_and_staff', sender: 'hello', replyTo: 'hello', classification: 'transactional',
    templatePrefix: 'service', deduplicationKey: '{event}:{aggregate_id}:{event_id}',
    retryPolicy: 'transactional_bounded', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'hello', sentryEscalation: 'permanent_failure', requiredConsent: 'service_contract',
    retention: 'support_record', connection: 'implemented_not_yet_triggered',
  },
);

const digital = define(
  ['digital.project_created', 'digital.draft_ready', 'digital.published', 'digital.rsvp_received', 'digital.guest_update', 'digital.expiry_warning'],
  {
    trigger: 'Dijital davetiye yaşam döngüsü işlemi', source: 'digital invitation service',
    recipient: 'customer', sender: 'hello', replyTo: 'orders', classification: 'transactional',
    templatePrefix: 'digital', deduplicationKey: '{event}:{project_id}:{event_id}',
    retryPolicy: 'transactional_bounded', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'orders', sentryEscalation: 'permanent_failure', requiredConsent: 'service_contract',
    retention: 'commerce_audit', connection: 'implemented_not_yet_triggered',
  },
);

const support = define(
  ['support.case_created', 'support.reply_received', 'support.case_updated', 'support.case_resolved', 'support.sla_warning'],
  {
    trigger: 'Destek kaydı veya SLA durumu değişikliği', source: 'support service',
    recipient: 'customer_and_staff', sender: 'hello', replyTo: 'support', classification: 'transactional',
    templatePrefix: 'support', deduplicationKey: '{event}:{case_id}:{event_id}',
    retryPolicy: 'staff_critical', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'support', sentryEscalation: 'permanent_failure', requiredConsent: 'legitimate_interest',
    retention: 'support_record', connection: 'implemented_not_yet_triggered',
  },
);

const staff = define(
  ['staff.new_order', 'staff.payment_failure', 'staff.payment_mismatch', 'staff.refund_required', 'staff.proof_overdue', 'staff.production_blocked', 'staff.shipment_failure', 'staff.email_bounced', 'staff.email_complained', 'staff.auth_failure_spike', 'staff.worker_failure', 'staff.reconciliation_critical', 'staff.legal_request', 'staff.security_incident'],
  {
    trigger: 'Kritik operasyon eşiği veya kalıcı hata', source: 'outbox / auth / commerce observability',
    recipient: 'staff', sender: 'hello', replyTo: 'support', classification: 'operational',
    templatePrefix: 'staff', deduplicationKey: '{event}:{aggregate_id}:{window}',
    retryPolicy: 'staff_critical', suppressionPolicy: 'permanent_delivery_failure',
    adminOwner: 'platform', sentryEscalation: 'immediate', requiredConsent: 'legitimate_interest',
    retention: 'support_record', connection: 'implemented_not_yet_triggered',
  },
);

const marketing = define(
  ['marketing.welcome_series', 'marketing.abandoned_cart', 'marketing.wishlist_reminder', 'marketing.back_in_stock', 'marketing.new_collection', 'marketing.anniversary', 'marketing.vip_invitation'],
  {
    trigger: 'Ayrı pazarlama servisi ve geçerli açık rıza', source: 'marketing service / notification_preferences',
    recipient: 'customer', sender: 'hello', replyTo: 'hello', classification: 'marketing',
    templatePrefix: 'marketing', deduplicationKey: '{event}:{customer_id}:{campaign_id}',
    retryPolicy: 'marketing_separate', suppressionPolicy: 'consent_and_delivery_failure',
    adminOwner: 'hello', sentryEscalation: 'none', requiredConsent: 'marketing_opt_in',
    retention: 'marketing_consent', connection: 'implemented_not_yet_triggered',
  },
);

export const notificationEventCatalog = [
  ...auth, ...order, ...payment, ...proof, ...fulfilment, ...service, ...digital,
  ...support, ...staff, ...marketing,
] as const;

export const notificationEventByKey = new Map(
  notificationEventCatalog.map((definition) => [definition.eventKey, definition]),
);
