const SENSITIVE_KEY =
  /(authorization|cookie|token|secret|password|code|email|phone|payload|body)/i;

export function scrubTelemetry(value: unknown, depth = 0): unknown {
  if (depth > 5) return '[SINIRLANDIRILDI]';
  if (Array.isArray(value))
    return value.slice(0, 20).map((item) => scrubTelemetry(item, depth + 1));
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && value.length > 500) return `${value.slice(0, 500)}…`;
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      SENSITIVE_KEY.test(key) ? '[GİZLENDİ]' : scrubTelemetry(entry, depth + 1),
    ]),
  );
}
