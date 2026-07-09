/**
 * WebGL capability gate (pre-production lock §6/§8).
 *
 * The cinematic stages render only when the device can honour them:
 * WebGL2, motion allowed, desktop viewport, adequate memory, and no
 * prior WebGL crash this session. Everything else gets the poster.
 */

const FAILURE_FLAG = 'cherie-webgl-failed';

export function detectWebGLCapability(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (window.sessionStorage.getItem(FAILURE_FLAG)) return false;
  } catch {
    /* storage unavailable — continue with other checks */
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.innerWidth < 1024) return false;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2'));
  } catch {
    return false;
  }
}

/** Called by the stage error boundary — posters everywhere afterwards. */
export function flagWebGLFailure(): void {
  try {
    window.sessionStorage.setItem(FAILURE_FLAG, '1');
  } catch {
    /* ignore */
  }
}
