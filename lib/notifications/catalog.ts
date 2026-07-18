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
  retryPolicy: 'transactional_bounded' | 'staff_critical';
  suppressionPolicy: 'never_for_security' | 'permanent_delivery_failure';
  adminOwner: NotificationOwner;
  sentryEscalation: 'permanent_failure' | 'immediate';
  requiredConsent: 'service_contract' | 'legal_obligation' | 'legitimate_interest';
  retention: 'identity_audit' | 'commerce_audit' | 'support_record';
  connection: 'connected' | 'provider_managed';
}

type Input = Pick<
  NotificationEventDefinition,
  | 'eventKey'
  | 'templateKey'
  | 'source'
  | 'recipient'
  | 'replyTo'
  | 'classification'
  | 'deduplicationKey'
> &
  Partial<NotificationEventDefinition>;

function connected(input: Input): NotificationEventDefinition {
  return {
    trigger: 'Doğrulanmış uygulama işlemi veya veritabanı yaşam döngüsü olayı',
    sender: 'hello',
    retryPolicy: input.recipient === 'staff' ? 'staff_critical' : 'transactional_bounded',
    suppressionPolicy:
      input.classification === 'security'
        ? 'never_for_security'
        : 'permanent_delivery_failure',
    adminOwner: input.replyTo,
    sentryEscalation: input.recipient === 'staff' ? 'immediate' : 'permanent_failure',
    requiredConsent:
      input.classification === 'security' ? 'legitimate_interest' : 'service_contract',
    retention:
      input.classification === 'security'
        ? 'identity_audit'
        : input.replyTo === 'support'
          ? 'support_record'
          : 'commerce_audit',
    connection: 'connected',
    ...input,
  };
}

function providerManaged(input: Input): NotificationEventDefinition {
  return connected({
    ...input,
    trigger: 'Supabase Auth sağlayıcı yaşam döngüsü',
    connection: 'provider_managed',
  });
}

const customer = 'customer' as const;
const staff = 'staff' as const;
const transactional = 'transactional' as const;

export const notificationEventCatalog: NotificationEventDefinition[] = [
  providerManaged({ eventKey: 'auth.registration_requested', templateKey: 'auth-email-confirmation', source: 'Supabase Auth signUp', recipient: customer, replyTo: 'support', classification: 'security', deduplicationKey: 'provider:{auth_user_id}:signup' }),
  providerManaged({ eventKey: 'auth.email_confirmation_sent', templateKey: 'auth-email-confirmation', source: 'Supabase Auth confirmation mailer', recipient: customer, replyTo: 'support', classification: 'security', deduplicationKey: 'provider:{auth_user_id}:confirmation' }),
  providerManaged({ eventKey: 'auth.password_reset_requested', templateKey: 'auth-password-reset', source: 'Supabase Auth recovery mailer', recipient: customer, replyTo: 'support', classification: 'security', deduplicationKey: 'provider:{auth_user_id}:recovery' }),
  connected({ eventKey: 'auth.welcome', templateKey: 'account_welcome', source: 'auth callback / confirmed immediate session', recipient: customer, replyTo: 'support', classification: transactional, deduplicationKey: 'auth_welcome:{auth_user_id}' }),
  connected({ eventKey: 'auth.password_changed', templateKey: 'auth-password-changed', source: 'password update actions', recipient: customer, replyTo: 'support', classification: 'security', deduplicationKey: 'auth_password_changed:{auth_user_id}:{updated_at}' }),

  connected({ eventKey: 'order.received', templateKey: 'order_received', source: 'orders INSERT trigger', recipient: customer, replyTo: 'orders', classification: transactional, deduplicationKey: 'order_received:{order_id}:customer' }),
  ...([
    'paid','in_design','proof_sent','revision_requested','proof_approved','in_production',
    'quality_check','packed','shipped','delivered','completed','cancelled','refunded',
  ] as const).map((status) => connected({
    eventKey: `order.${status}`,
    templateKey: `order_status_${status}`,
    source: 'order_status_events INSERT trigger', recipient: customer, replyTo: 'orders',
    classification: transactional,
    deduplicationKey: `order_status:{order_id}:${status}:{event_id}`,
  })),

  connected({ eventKey: 'payment.pending', templateKey: 'payment_pending', source: 'orders INSERT trigger', recipient: customer, replyTo: 'payments', classification: transactional, deduplicationKey: 'order_received:{order_id}:customer' }),
  connected({ eventKey: 'payment.failed', templateKey: 'order_status_failed', source: 'verified applied payment_events trigger', recipient: customer, replyTo: 'payments', classification: transactional, deduplicationKey: 'payment_failed:{payment_id}:{provider_event_id}' }),
  connected({ eventKey: 'invoice.issued', templateKey: 'invoice_issued', source: 'orders e-invoice transition trigger', recipient: customer, replyTo: 'payments', classification: transactional, deduplicationKey: 'invoice_issued:{order_id}:{einvoice_ref}' }),
  ...([
    ['refund.requested','refund_requested'],
    ['refund.approved','refund_approved'],
    ['refund.processing','refund_submitted'],
    ['refund.succeeded','refund_succeeded'],
    ['refund.failed','refund_failed'],
  ] as const).map(([eventKey, templateKey]) => connected({
    eventKey, templateKey, source: 'audited refund RPC', recipient: customer,
    replyTo: 'payments', classification: transactional,
    deduplicationKey: `${eventKey}:{refund_id}:customer`,
  })),

  connected({ eventKey: 'shipment.dispatched', templateKey: 'shipment-dispatched', source: 'shipments status trigger', recipient: customer, replyTo: 'orders', classification: transactional, deduplicationKey: 'shipment_dispatched:{shipment_id}:shipped' }),
  connected({ eventKey: 'shipment.in_transit', templateKey: 'shipment_in_transit', source: 'shipments status trigger', recipient: customer, replyTo: 'orders', classification: transactional, deduplicationKey: 'shipment_in_transit:{shipment_id}:in_transit' }),
  connected({ eventKey: 'shipment.delivered', templateKey: 'shipment-delivered', source: 'shipments status trigger', recipient: customer, replyTo: 'orders', classification: transactional, deduplicationKey: 'shipment_delivered:{shipment_id}:delivered' }),
  connected({ eventKey: 'shipment.returned', templateKey: 'shipment_returned', source: 'shipments status trigger', recipient: customer, replyTo: 'orders', classification: transactional, deduplicationKey: 'shipment_returned:{shipment_id}:returned' }),

  ...([
    ['appointment.requested','appointment-requested'],
    ['appointment.confirmed','appointment-confirmed'],
    ['appointment.rescheduled','appointment-rescheduled'],
    ['appointment.cancelled','appointment-cancelled'],
  ] as const).map(([eventKey, templateKey]) => connected({
    eventKey, templateKey, source: 'consultations lifecycle trigger', recipient: customer,
    replyTo: 'hello', classification: transactional,
    deduplicationKey: `${eventKey}:{consultation_id}:{slot_signature}`,
  })),
  ...([
    ['contact.received','intake_contact_received'],
    ['quote.requested','intake_quote_received'],
    ['appointment.intake_received','intake_appointment_received'],
    ['dream.received','intake_dream_received'],
  ] as const).map(([eventKey, templateKey]) => connected({
    eventKey, templateKey, source: 'leads INSERT trigger', recipient: customer,
    replyTo: 'hello', classification: transactional,
    deduplicationKey: `intake_received:{lead_id}:customer`,
  })),

  connected({ eventKey: 'support.case_created', templateKey: 'support-case-created', source: 'support thread INSERT trigger', recipient: customer, replyTo: 'support', classification: transactional, deduplicationKey: 'support_case_created:{thread_id}:open' }),
  connected({ eventKey: 'support.reply_received', templateKey: 'support-case-updated', source: 'public staff support reply trigger', recipient: customer, replyTo: 'support', classification: transactional, deduplicationKey: 'support_reply_received:{message_id}' }),
  connected({ eventKey: 'support.case_updated', templateKey: 'support-case-updated', source: 'support thread status trigger', recipient: customer, replyTo: 'support', classification: transactional, deduplicationKey: 'support_case_updated:{thread_id}:{status}' }),
  connected({ eventKey: 'support.case_resolved', templateKey: 'support-case-resolved', source: 'support thread closed trigger', recipient: customer, replyTo: 'support', classification: transactional, deduplicationKey: 'support_case_resolved:{thread_id}:closed' }),

  connected({ eventKey: 'staff.payment_failure', templateKey: 'staff_payment_failed', source: 'verified applied payment_events trigger', recipient: staff, replyTo: 'payments', classification: 'operational', deduplicationKey: 'payment_failed:{payment_id}:{provider_event_id}:staff' }),
  connected({ eventKey: 'staff.refund_failure', templateKey: 'staff_refund_failed', source: 'audited refund result RPC', recipient: staff, replyTo: 'payments', classification: 'operational', deduplicationKey: 'refund_failed:{refund_id}:staff' }),
  connected({ eventKey: 'staff.notification_permanently_failed', templateKey: 'staff_notification_permanently_failed', source: 'notification worker terminal failure', recipient: staff, replyTo: 'support', classification: 'operational', deduplicationKey: 'notification_failed:{notification_id}:staff' }),
];

export const notificationEventByKey = new Map(
  notificationEventCatalog.map((definition) => [definition.eventKey, definition]),
);
