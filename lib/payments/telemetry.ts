type PaymentSignal =
  | 'callback_received'
  | 'callback_rejected'
  | 'callback_applied'
  | 'callback_duplicate'
  | 'callback_discrepancy'
  | 'provider_timeout'
  | 'rpc_failure'
  | 'refund_failure'
  | 'reconciliation_discrepancy';

export function paymentTelemetry(
  signal: PaymentSignal,
  metadata: Record<string, unknown>,
  severity: 'info' | 'warning' | 'error' = 'info',
) {
  const safe = redactMetadata(metadata);
  const line = JSON.stringify({
    scope: 'payments',
    signal,
    severity,
    timestamp: new Date().toISOString(),
    ...safe,
  });
  if (severity === 'error') console.error(line);
  else if (severity === 'warning') console.warn(line);
  else console.info(line);
}

export function redactMetadata(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (/key|salt|secret|token|hash|email|phone|address|name|payload/i.test(key)) {
        return [key, '[redacted]'];
      }
      if (typeof entry === 'string') return [key, entry.slice(0, 160)];
      if (typeof entry === 'number' || typeof entry === 'boolean' || entry === null) {
        return [key, entry];
      }
      return [key, '[redacted]'];
    }),
  );
}
