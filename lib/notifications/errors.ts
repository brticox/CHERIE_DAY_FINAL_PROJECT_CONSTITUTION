const PERMANENT_CODES = new Set(['invalid_email', 'validation_error', 'missing_recipient', 'template_not_found']);

export class NotificationError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

export function classifyNotificationError(error: unknown) {
  if (error instanceof NotificationError) return error;
  const message = error instanceof Error ? error.message : 'Bilinmeyen sağlayıcı hatası';
  const code = extractSafeCode(message);
  return new NotificationError(redactError(message), code, !PERMANENT_CODES.has(code));
}

export function redactError(message: string) {
  return message
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email-redacted]')
    .replace(/(?:re_|key_|token_)[A-Za-z0-9_-]{8,}/g, '[secret-redacted]')
    .slice(0, 500);
}

function extractSafeCode(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid') && normalized.includes('email')) return 'invalid_email';
  if (normalized.includes('timeout')) return 'provider_timeout';
  if (normalized.includes('rate')) return 'provider_rate_limit';
  if (normalized.includes('template')) return 'template_not_found';
  return 'provider_error';
}
