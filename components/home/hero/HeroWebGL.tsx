'use client';

import dynamic from 'next/dynamic';

/**
 * Kill switch — flip to `false` to restore the exact Phase 2A homepage
 * hero (poster + text, no canvas, no three.js chunk ever requested).
 */
export const HERO_WEBGL_ENABLED = false;

/**
 * ssr:false — the stage never renders on the server, so the SSR overture
 * stays the LCP and there is no hydration surface. The three/r3f stack
 * lives one dynamic level deeper (inside HeroStage) and is fetched only
 * when WebGLGuard approves.
 */
const HeroStage = dynamic(
  () => import('./HeroStage.client').then((m) => m.HeroStage),
  { ssr: false, loading: () => null },
);

/**
 * HeroWebGL — the homepage's only doorway into WebGL (Phase 3).
 *
 * Rendered inside HeroOverture's sticky frame. Attach mode: HeroStage
 * measures the `[data-hero-runway]` ancestor for scroll progress and
 * drives the overture text choreography via CSS vars. The ?p= debug
 * override compiles away outside development.
 */
export function HeroWebGL() {
  if (!HERO_WEBGL_ENABLED) return null;
  return <HeroStage debug={process.env.NODE_ENV === 'development'} textFade />;
}
