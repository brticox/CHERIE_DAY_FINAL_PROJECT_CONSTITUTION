import type { EmailMessage, EmailTransport, TransportResult } from '../types';

export class CaptureTransport implements EmailTransport {
  readonly name = 'capture';
  async send(message: EmailMessage): Promise<TransportResult> {
    return { provider: this.name, messageId: `capture:${message.idempotencyKey}` };
  }
}
