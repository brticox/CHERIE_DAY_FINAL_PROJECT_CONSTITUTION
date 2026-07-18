'use client';

import { useEffect, useRef } from 'react';

/**
 * HeroVideoScrub — scroll-scrubbed cinematic video layer for the Hero.
 *
 * Strategy:
 *   • The video is NEVER auto-played. `video.currentTime` is the sole driver.
 *   • Opacity envelope (smooth crossfade with the static poster):
 *       p = 0.00 → 0.05  : opacity = 0   (poster is the only visible surface)
 *       p = 0.05 → 0.14  : opacity 0 → 1  (video fades in over the poster)
 *       p = 0.14 → 0.84  : opacity = 1   (video is the full cinematic surface)
 *       p = 0.84 → 0.96  : opacity 1 → 0  (poster reasserts)
 *       p > 0.96         : opacity = 0   (poster-only at runway end)
 *
 * Gates: desktop ≥1024 px · fine pointer · prefers-reduced-motion: no-preference.
 * On mobile / reduced-motion the element is mounted but stays opacity:0, so
 * the gate is purely opacity-driven and never causes layout shift.
 */

const FADE_IN_START = 0.05;
const FADE_IN_END = 0.14;
const FADE_OUT_START = 0.65;
const FADE_OUT_END = 0.75;

function smoothstep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function calcOpacity(p: number): number {
  if (p <= FADE_IN_START) return 0;
  if (p <= FADE_IN_END) return smoothstep(FADE_IN_START, FADE_IN_END, p);
  if (p <= FADE_OUT_START) return 1;
  if (p <= FADE_OUT_END) return 1 - smoothstep(FADE_OUT_START, FADE_OUT_END, p);
  return 0;
}

export function HeroVideoScrub() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    // ── Resolve the runway host ────────────────────────────────────────
    const runway = wrap.closest<HTMLElement>('[data-hero-runway]');
    if (!runway) return;

    // ── Media gates (fine pointer · ≥1024 · no reduced-motion) ────────
    const mqFine = window.matchMedia('(pointer: fine)');
    const mqWide = window.matchMedia('(min-width: 1024px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const gatesPass = () => mqFine.matches && mqWide.matches && mqMotion.matches;

    // ── State ──────────────────────────────────────────────────────────
    let raf = 0;
    let rafRunning = false;
    let videoReady = false;
    let lastOpacity = -1;
    let lastTime = -1;
    let currentPlayTime = 0;

    const onReady = () => {
      videoReady = true;
    };
    video.addEventListener('canplay', onReady, { once: true });

    // ── Gate the buffer start, not just the opacity ──────────────────
    // The wrap stays opacity:0 forever when gatesPass() is false (mobile /
    // coarse pointer / reduced-motion), so this layer can never be seen
    // there — yet `preload="auto"` was unconditionally fetching the full
    // ~2.1 MB file on every pageview regardless of viewport. Buffering now
    // only starts once the gates are actually satisfied, and re-checks on
    // gate changes (e.g. resizing across the 1024px breakpoint) so a
    // qualifying visitor still gets the exact same eager, zero-delay
    // buffering as before — nothing changes for desktop.
    let loadStarted = false;
    const startLoadIfNeeded = () => {
      if (loadStarted || !gatesPass()) return;
      loadStarted = true;
      video.preload = 'auto';
      video.load(); // begin buffering immediately
    };
    startLoadIfNeeded();
    mqFine.addEventListener('change', startLoadIfNeeded);
    mqWide.addEventListener('change', startLoadIfNeeded);
    mqMotion.addEventListener('change', startLoadIfNeeded);

    // ── rAF tick ──────────────────────────────────────────────────────
    const tick = () => {
      // progress 0..1 — identical formula to useScrollProgress
      const rect = runway.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;

      // drive currentTime (frame-precise scrub with buttery smooth lerp)
      if (videoReady && video.duration > 0) {
        // Map 0 -> 100% video duration strictly to the fully visible window
        // so no part of the video is hidden during the fade phases.
        const scrubP = Math.max(0, Math.min(1, (p - FADE_IN_END) / (FADE_OUT_START - FADE_IN_END)));
        const targetTime = scrubP * video.duration;

        // Lerp factor: 0.08 offers a buttery smooth catch-up without feeling detached
        currentPlayTime += (targetTime - currentPlayTime) * 0.08;

        if (Math.abs(currentPlayTime - lastTime) > 0.01) {
          lastTime = currentPlayTime;
          video.currentTime = currentPlayTime;
        }
      }

      // drive opacity (gates-aware)
      const raw = gatesPass() ? calcOpacity(p) : 0;
      const opacity = Math.round(raw * 1000) / 1000;
      if (Math.abs(opacity - lastOpacity) > 0.003) {
        lastOpacity = opacity;
        wrap.style.opacity = String(opacity);
      }

      raf = requestAnimationFrame(tick);
    };

    const startRaf = () => {
      if (!rafRunning) {
        rafRunning = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const stopRaf = () => {
      if (rafRunning) {
        rafRunning = false;
        cancelAnimationFrame(raf);
      }
    };

    // only run rAF while the hero is near the viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) startRaf();
        else stopRaf();
      },
      { rootMargin: '100% 0px 100% 0px' },
    );
    io.observe(runway);

    return () => {
      io.disconnect();
      stopRaf();
      video.removeEventListener('canplay', onReady);
      mqFine.removeEventListener('change', startLoadIfNeeded);
      mqWide.removeEventListener('change', startLoadIfNeeded);
      mqMotion.removeEventListener('change', startLoadIfNeeded);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: 0, willChange: 'opacity' }}
    >
      <video
        ref={videoRef}
        src="/home/hero/hero-video-optimized.mp4"
        poster="/home/hero/hero-video-poster.jpg"
        preload="none"
        muted
        playsInline
        autoPlay={false}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}
