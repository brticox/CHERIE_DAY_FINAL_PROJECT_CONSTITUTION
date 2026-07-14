import 'server-only';

import { NotificationError } from '../errors';
import type { EmailMessage, EmailTransport, TransportResult } from '../types';

export class ResendTransport implements EmailTransport {
  readonly name = 'resend';

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly replyTo?: string,
  ) {}

  async send(message: EmailMessage): Promise<TransportResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': message.idempotencyKey,
        },
        body: JSON.stringify({
          from: this.from,
          to: [message.to],
          reply_to: message.replyTo ?? this.replyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
        signal: controller.signal,
      });
      const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!response.ok || !body.id) {
        const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
        throw new NotificationError(`Resend ${response.status}: ${body.message ?? 'delivery failed'}`, `resend_${response.status}`, retryable);
      }
      return { provider: this.name, messageId: body.id };
    } catch (error) {
      if (error instanceof NotificationError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NotificationError('Resend request timeout', 'provider_timeout', true);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
