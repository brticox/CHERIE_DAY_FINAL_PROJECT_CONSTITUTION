import Link from 'next/link';

import type { OccasionTile } from '@/lib/home/home-data';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/** Per-occasion diorama tint (token palette only — no new colors). */
const TINTS = [
  'from-cherie-lace/70 to-cherie-paper',
  'from-cherie-mist/80 to-cherie-paper',
  'from-cherie-paper to-cherie-lace/60',
  'from-cherie-lace/50 to-cherie-mist/70',
] as const;

/**
 * OccasionDioramas — "Hangi gününüz için buradasınız?"
 * Four ceremony windows (İsteme → Söz/Nişan → Nikah → Düğün), each a small
 * 2-layer diorama: tinted scene + floating object placeholder that drifts on
 * hover and with the cursor field. The ribbon marks each doorway's threshold.
 */
export function OccasionDioramas({ occasions }: { occasions: OccasionTile[] }) {
  return (
    <SectionShell
      eyebrow="Deneyimler"
      title="Hangi gününüz için buradasınız?"
      lede="İstemeden düğüne — her törenin kendi dünyası, kendi detayları, kendi zarafeti var."
      className="bg-cherie-ivory"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {occasions.map((occasion, i) => (
          <Reveal key={occasion.slug} delay={i * 0.1}>
            <Link
              href={occasion.href}
              className="group relative block overflow-hidden rounded-card border border-cherie-lace shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1"
            >
              {/* diorama scene layer */}
              <div
                className={`relative aspect-[4/5] bg-gradient-to-b ${TINTS[i % TINTS.length]}`}
              >
                {/* floating ceremony-object placeholder (final art in Phase 5) */}
                <ParallaxLayer
                  aria-hidden
                  depth={6 + i * 2}
                  className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="h-20 w-20 rounded-full border border-cherie-brass/50 bg-cherie-ivory/70 shadow-card transition-transform duration-card ease-cherie group-hover:scale-105" />
                </ParallaxLayer>
                {/* ribbon threshold: thin cherry knot line at the doorway */}
                <div
                  aria-hidden
                  className="absolute inset-x-6 bottom-[26%] h-px bg-cherie-cherry/50 transition-colors duration-card ease-cherie group-hover:bg-cherie-cherry"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cherie-ivory via-cherie-ivory/90 to-transparent p-5 pt-10">
                  <h3 className="font-display text-xl text-cherie-ink">{occasion.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-cherie-soft-ink">
                    {occasion.summary}
                  </p>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
