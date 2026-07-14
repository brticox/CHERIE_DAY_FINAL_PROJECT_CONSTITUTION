const RETRY_DELAYS_MS = [60_000, 300_000, 1_200_000, 3_600_000, 21_600_000] as const;

export function nextRetryAt(attempt: number, seed = Math.random()) {
  const base = RETRY_DELAYS_MS[Math.min(Math.max(attempt - 1, 0), RETRY_DELAYS_MS.length - 1)] ?? RETRY_DELAYS_MS[0];
  const jitter = Math.round(base * 0.2 * Math.max(0, Math.min(seed, 1)));
  return new Date(Date.now() + base + jitter);
}

export function shouldRetry(retryable: boolean, attempt: number, maxAttempts: number) {
  return retryable && attempt < maxAttempts;
}
