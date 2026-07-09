/** Tiny easing/interpolation helpers shared by the hero scene. */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Normalized window: 0 before `start`, 1 after `end`. */
export const window01 = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Rise-then-fall pulse across [start,end] — used for the climax burst. */
export const pulse = (p: number, start: number, end: number) => {
  const t = window01(p, start, end);
  return Math.sin(Math.PI * clamp01(t));
};
