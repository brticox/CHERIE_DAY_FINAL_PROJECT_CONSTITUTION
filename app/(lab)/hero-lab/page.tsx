import type { Metadata } from 'next';

import { HeroLabStage } from '@/components/home/hero/HeroLabStage.client';

/**
 * /hero-lab — Phase 2B Mini Hero Lab (workshop route, noindex).
 *
 * Proves the Shopify-class system in isolation: a pinned 400vh runway whose
 * scroll progress scrubs a WebGL promise scene (abstract presences → gesture
 * strokes → ring/light climax → maison objects born from the light), with
 * mouse-reactive depth, WebGLGuard, and a poster fallback.
 *
 * The homepage is untouched — this route exists to approve the *feel*
 * before Phase 3 integration.
 */
export const metadata: Metadata = {
  title: 'Hero Lab',
  robots: { index: false, follow: false },
};

export default function HeroLabPage() {
  return (
    <main className="bg-cherie-ivory">
      <HeroLabStage />

      {/* release strip — proves the pin lets go and the canvas unmounts */}
      <section className="flex h-[70vh] items-center justify-center border-t border-cherie-lace bg-cherie-paper/40">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-cherie-brass">
          Lab sonu — sahne serbest bırakıldı
        </p>
      </section>
    </main>
  );
}
