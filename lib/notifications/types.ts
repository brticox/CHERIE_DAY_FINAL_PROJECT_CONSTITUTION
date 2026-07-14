import type { Json } from '@/lib/supabase/database.types';

export type NotificationCategory = 'transactional' | 'operational' | 'security' | 'marketing';

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export interface NotificationPayload {
  customer_name?: string;
  order_number?: string;
  title?: string;
  status?: string;
  intake_type?: string;
  lead_id?: string;
  order_id?: string;
  [key: string]: Json | undefined;
}

export interface EmailMessage extends RenderedEmail {
  to: string;
  idempotencyKey: string;
}

export interface TransportResult {
  provider: string;
  messageId: string;
}

export interface EmailTransport {
  readonly name: string;
  send(message: EmailMessage): Promise<TransportResult>;
}
