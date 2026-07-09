import Link from 'next/link';

import type { Department } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';
import { StageFrame } from '@/components/home/primitives/StageFrame';

/**
 * Abstract brass line-art glyph per world — a *hint* of the object on its
 * vitrine, not clipart. Refined placeholder until Phase 5 GLB renders.
 */
function WorldGlyph({ slug }: { slug: string }) {
  const common = {
    fill: 'none',
    stroke: '#B08A57',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (slug) {
    case 'davetiye': // invitation card + fold
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <rect x="14" y="18" width="36" height="28" rx="2" {...common} />
          <path d="M14 22 L32 34 L50 22" {...common} />
        </svg>
      );
    case 'hediyelik': // gift box + bow
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <rect x="16" y="28" width="32" height="20" rx="2" {...common} />
          <path d="M16 34 H48 M32 28 V48" {...common} />
          <path d="M32 28 C 26 18, 18 20, 24 28 M32 28 C 38 18, 46 20, 40 28" {...common} />
        </svg>
      );
    case 'nisan-tepsisi': // tray + two rings
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <ellipse cx="32" cy="40" rx="24" ry="8" {...common} />
          <circle cx="27" cy="32" r="6" {...common} />
          <circle cx="37" cy="32" r="6" {...common} />
        </svg>
      );
    case 'yuzukler': // ring + gem
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <circle cx="32" cy="38" r="13" {...common} />
          <path d="M26 22 L32 14 L38 22 L32 26 Z" {...common} />
        </svg>
      );
    case 'muhur-kurdele': // wax seal + ribbon tails
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <circle cx="32" cy="26" r="12" {...common} />
          <circle cx="32" cy="26" r="6" {...common} />
          <path d="M24 36 L20 52 L28 46 M40 36 L44 52 L36 46" {...common} />
        </svg>
      );
    case 'kutu-paketleme': // box + ribbon cross
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path d="M32 14 L52 24 L52 44 L32 54 L12 44 L12 24 Z" {...common} />
          <path d="M32 14 V54 M12 24 L52 24" {...common} />
        </svg>
      );
    default: // generic maison mark
      return (
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <circle cx="32" cy="32" r="16" {...common} />
          <path d="M24 32 H40 M32 24 V40" {...common} />
        </svg>
      );
  }
}

/**
 * ProductWorlds — the maison's worlds as luxury vitrines.
 *
 * Each card is a lit display case: a spotlit stage with a pedestal, a floating
 * object glyph at its own parallax depth, a brass frame + cherry ribbon detail,
 * and a glass sheen. Phase 4 replaces the vitrine interior with the pinned R3F
 * showcase; these vitrines then serve as its poster fallback.
 */
export function ProductWorlds({ worlds }: { worlds: Department[] }) {
  return (
    <StageFrame stage="product-worlds" className="bg-cherie-paper/50">
      <SectionShell
        eyebrow="Mağaza"
        title="Maison'un dünyaları"
        lede="Her dünya kendi ritüelini taşır; hepsi aynı imzayla, birer vitrin zarafetinde tasarlanır."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world, i) => (
            <Reveal key={world.slug} delay={(i % 3) * 0.1}>
              <Link
                href={`${ROUTES.magaza}/${world.slug}`}
                className="group relative block h-full overflow-hidden rounded-card border border-cherie-lace bg-cherie-ivory shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1.5"
              >
                {/* ── the vitrine: spotlit display stage ── */}
                <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-b from-cherie-paper/40 to-cherie-mist/60">
                  {/* overhead spotlight */}
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-80 transition-opacity duration-card ease-cherie group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(52% 46% at 50% 8%, rgba(250,247,241,0.95) 0%, rgba(250,247,241,0) 62%)',
                    }}
                  />
                  {/* brass corner frame */}
                  <span aria-hidden className="absolute left-3 top-3 h-4 w-4 border-l border-t border-cherie-brass/60" />
                  <span aria-hidden className="absolute right-3 top-3 h-4 w-4 border-r border-t border-cherie-brass/60" />

                  {/* pedestal shadow (grounds the object — no floating clipart) */}
                  <div
                    aria-hidden
                    className="absolute bottom-[20%] left-1/2 h-3 w-24 -translate-x-1/2 rounded-[50%] bg-cherie-ink/10 blur-md transition-all duration-card ease-cherie group-hover:w-28 group-hover:opacity-80"
                  />
                  {/* floating object glyph — its own parallax depth */}
                  <ParallaxLayer
                    depth={6 + (i % 3) * 3}
                    className="absolute inset-x-0 top-[26%] flex justify-center"
                  >
                    <div className="h-20 w-20 text-cherie-brass transition-transform duration-card ease-cherie group-hover:-translate-y-1 group-hover:scale-105">
                      <WorldGlyph slug={world.slug} />
                    </div>
                  </ParallaxLayer>
                  {/* cherry ribbon detail across the vitrine sill */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-[18%] h-px bg-cherie-cherry/40 transition-colors duration-card ease-cherie group-hover:bg-cherie-cherry/70"
                  />
                  {/* glass sheen */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-cherie-ivory/0 to-cherie-ivory/25"
                  />
                </div>

                {/* ── plaque ── */}
                <div className="p-7">
                  <div className="h-px w-8 bg-cherie-cherry/70" />
                  <h3 className="mt-4 font-display text-2xl text-cherie-ink">{world.name_tr}</h3>
                  {world.description ? (
                    <p className="mt-2.5 text-sm leading-6 text-cherie-soft-ink">
                      {world.description}
                    </p>
                  ) : null}
                  <span className="mt-5 inline-block text-sm font-medium text-cherie-burgundy underline-offset-4 group-hover:underline">
                    Dünyayı Aç
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <Link
            href={ROUTES.magaza}
            className="inline-flex h-11 items-center justify-center rounded-control border border-cherie-burgundy px-6 text-sm font-medium text-cherie-burgundy transition-colors duration-control ease-cherie hover:bg-cherie-ivory"
          >
            Tüm Mağazayı Gör
          </Link>
        </Reveal>
      </SectionShell>
    </StageFrame>
  );
}
