import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Heart, Flower2 } from 'lucide-react';

import type { Department } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { departments } from '@/content/seed/catalog';
import { Reveal } from '@/components/home/primitives/Reveal';

/**
 * Decorative hearts + roses drifting across the flagship's red field. Purely
 * CSS-animated (no JS) so it stays a server component. `drift` ornaments bob
 * in place; `rose` items fly slowly upward. Tokens/decorative tones only.
 */
type Decor = {
  kind: 'heart' | 'rose';
  motion: 'drift' | 'fly';
  tone: string;
  size: number;
  left: string;
  top?: string;
  bottom?: string;
  dur: string;
  delay: string;
  rot?: string;
  tx?: string;
  ty?: string;
  lo?: string;
  hi?: string;
  peak?: string;
};

const FLAGSHIP_DECOR: Decor[] = [
  {
    kind: 'heart',
    motion: 'drift',
    tone: '#c99a63',
    size: 24,
    left: '6%',
    top: '18%',
    dur: '8s',
    delay: '0s',
    rot: '-8deg',
    tx: '5px',
    ty: '-12px',
    lo: '0.3',
    hi: '0.72',
  },
  {
    kind: 'heart',
    motion: 'drift',
    tone: '#e8d8c7',
    size: 14,
    left: '30%',
    top: '12%',
    dur: '10s',
    delay: '1.4s',
    rot: '6deg',
    tx: '-6px',
    ty: '-10px',
    lo: '0.24',
    hi: '0.6',
  },
  {
    kind: 'rose',
    motion: 'drift',
    tone: '#c99a63',
    size: 28,
    left: '10%',
    top: '50%',
    dur: '11s',
    delay: '0.8s',
    rot: '10deg',
    tx: '7px',
    ty: '-14px',
    lo: '0.26',
    hi: '0.6',
  },
  {
    kind: 'heart',
    motion: 'drift',
    tone: '#d98a95',
    size: 13,
    left: '40%',
    top: '36%',
    dur: '9s',
    delay: '2.4s',
    rot: '0deg',
    tx: '4px',
    ty: '-9px',
    lo: '0.28',
    hi: '0.66',
  },
  {
    kind: 'rose',
    motion: 'drift',
    tone: '#e8d8c7',
    size: 19,
    left: '4%',
    top: '40%',
    dur: '12s',
    delay: '3.2s',
    rot: '-12deg',
    tx: '-5px',
    ty: '-12px',
    lo: '0.24',
    hi: '0.58',
  },
  {
    kind: 'heart',
    motion: 'drift',
    tone: '#c99a63',
    size: 17,
    left: '21%',
    top: '70%',
    dur: '8.5s',
    delay: '1s',
    rot: '8deg',
    tx: '6px',
    ty: '-10px',
    lo: '0.26',
    hi: '0.62',
  },
  {
    kind: 'heart',
    motion: 'drift',
    tone: '#d98a95',
    size: 15,
    left: '15%',
    top: '32%',
    dur: '9.5s',
    delay: '3.8s',
    rot: '-4deg',
    tx: '-5px',
    ty: '-11px',
    lo: '0.22',
    hi: '0.56',
  },
  {
    kind: 'rose',
    motion: 'drift',
    tone: '#c99a63',
    size: 22,
    left: '34%',
    top: '58%',
    dur: '10.5s',
    delay: '2s',
    rot: '12deg',
    tx: '6px',
    ty: '-13px',
    lo: '0.22',
    hi: '0.54',
  },
  {
    kind: 'rose',
    motion: 'fly',
    tone: '#c99a63',
    size: 26,
    left: '9%',
    bottom: '4%',
    dur: '13s',
    delay: '0s',
    peak: '0.6',
  },
  {
    kind: 'rose',
    motion: 'fly',
    tone: '#e8d8c7',
    size: 19,
    left: '33%',
    bottom: '2%',
    dur: '16s',
    delay: '4s',
    peak: '0.5',
  },
  {
    kind: 'rose',
    motion: 'fly',
    tone: '#d98a95',
    size: 22,
    left: '45%',
    bottom: '7%',
    dur: '15s',
    delay: '7.5s',
    peak: '0.52',
  },
  {
    kind: 'heart',
    motion: 'fly',
    tone: '#c99a63',
    size: 18,
    left: '20%',
    bottom: '3%',
    dur: '14s',
    delay: '2.5s',
    peak: '0.55',
  },
];

/**
 * Small embossed brass emblem per world — a whisper of the object, not clipart.
 * Kept intentionally small (≤28px) so it reads as a maker's mark, never as the
 * cheap oversized line-icon the owner rejected.
 */
function WorldMotif({ slug }: { slug: string }) {
  const s = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const paths: Record<string, React.ReactNode> = {
    davetiye: (
      <>
        <rect x="4" y="6" width="20" height="16" rx="1.5" {...s} />
        <path d="M4 8 L14 15 L24 8" {...s} />
      </>
    ),
    hediyelik: (
      <>
        <rect x="6" y="12" width="16" height="11" rx="1" {...s} />
        <path d="M6 15 H22 M14 12 V23" {...s} />
        <path d="M14 12 C10 6 6 8 10 12 M14 12 C18 6 22 8 18 12" {...s} />
      </>
    ),
    'nisan-tepsisi': (
      <>
        <ellipse cx="14" cy="18" rx="11" ry="4" {...s} />
        <circle cx="11" cy="12" r="3.2" {...s} />
        <circle cx="17" cy="12" r="3.2" {...s} />
      </>
    ),
    yuzukler: (
      <>
        <circle cx="14" cy="17" r="6.5" {...s} />
        <path d="M10 8 L14 3 L18 8 L14 11 Z" {...s} />
      </>
    ),
    'muhur-kurdele': (
      <>
        <circle cx="14" cy="11" r="6" {...s} />
        <circle cx="14" cy="11" r="3" {...s} />
        <path d="M9 16 L6 24 L11 21 M19 16 L22 24 L17 21" {...s} />
      </>
    ),
    'kutu-paketleme': (
      <>
        <path d="M14 4 L24 9 L24 19 L14 24 L4 19 L4 9 Z" {...s} />
        <path d="M14 4 V24 M4 9 L24 9" {...s} />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden>
      {paths[slug] ?? <circle cx="14" cy="14" r="8" {...s} />}
    </svg>
  );
}

export function ProductWorlds({ worlds }: { worlds: Department[] }) {
  const flagship = worlds[0];
  if (!flagship) return null;
  // Break the flagship title after the ampersand: "Davetiye &" / "Basılı Ürünler".
  const flagshipTitle = flagship.name_tr.replace(' & ', ' &\n');
  const rest = worlds.slice(1);
  const supporting = rest.slice(0, 2); // stacked beside the flagship
  const minor = rest.slice(2); // smaller row beneath

  return (
    <section className="relative bg-cherie-paper/50 py-20 md:py-28">
      <div className="cherie-container">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cherie-brass">
            Mağaza
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-h2 max-w-xl text-cherie-ink">
              Bir maison, on altı dünya.
            </h2>
            <p className="max-w-md text-base leading-7 text-cherie-soft-ink">
              Davetiyeden yüzüğe, mühürden hatıra albümüne — her dünya kendi ritüelini
              taşır, hepsi aynı imzayla vitrine çıkar.
            </p>
          </div>
          <div className="cd-rule mt-8 w-full" />
        </Reveal>

        {/* golden-ratio vitrine: flagship (1.618) + supporting column (1) */}
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.618fr_1fr]">
          {/* ── Flagship ── */}
          <Reveal>
            <Link
              href={`${ROUTES.magaza}/${flagship.slug}`}
              className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-velvet p-8 pb-16 text-cherie-ivory shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1 sm:p-10 sm:pb-20"
            >
              {/* invitation vitrine backdrop */}
              <div aria-hidden className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-cherie-burgundy/50 via-cherie-velvet to-cherie-velvet" />

                {/* animated hearts + roses in the red field (behind the photos) */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {FLAGSHIP_DECOR.map((d, i) => {
                    const Icon = d.kind === 'heart' ? Heart : Flower2;
                    const style =
                      d.motion === 'fly'
                        ? ({
                            left: d.left,
                            bottom: d.bottom,
                            '--dur': d.dur,
                            '--delay': d.delay,
                            '--peak': d.peak,
                          } as React.CSSProperties)
                        : ({
                            left: d.left,
                            top: d.top,
                            '--dur': d.dur,
                            '--delay': d.delay,
                            '--rot': d.rot,
                            '--tx': d.tx,
                            '--ty': d.ty,
                            '--lo': d.lo,
                            '--hi': d.hi,
                          } as React.CSSProperties);
                    return (
                      <span
                        key={i}
                        className={d.motion === 'fly' ? 'cd-rose' : 'cd-ornament'}
                        style={style}
                      >
                        <Icon
                          size={d.size}
                          color={d.tone}
                          fill={d.kind === 'heart' ? d.tone : 'none'}
                          strokeWidth={d.kind === 'heart' ? 0 : 1.4}
                        />
                      </span>
                    );
                  })}
                </div>

                {/* back invitation photo (sits in the top scene on mobile) */}
                <div className="cd-shine absolute right-3 top-4 aspect-[4/5] w-28 rotate-6 overflow-hidden rounded-sm border border-cherie-ivory/40 shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-cherie group-hover:rotate-3 sm:right-6 sm:top-6 sm:w-52">
                  <Image
                    src="/home/hero/cutouts/Photo1.png"
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
                {/* front invitation photo */}
                <div className="cd-shine absolute right-10 top-12 aspect-[4/5] w-28 -rotate-3 overflow-hidden rounded-sm border border-cherie-ivory/50 shadow-[0_34px_66px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-cherie group-hover:-rotate-1 sm:right-24 sm:top-20 sm:w-52">
                  <Image
                    src="/home/hero/cutouts/PHOTO2.png"
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>

                {/* velvet scrim — photos fade into velvet where the text lives,
                    so the copy is always legible (stronger on mobile) */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[66%] bg-gradient-to-t from-cherie-velvet via-cherie-velvet/85 to-transparent sm:h-1/2 sm:via-cherie-velvet/45"
                />

                <div className="m-vignette" />

                {/* transparent cutout card — rests on the invitation stack on
                    mobile, floats in the bottom-right corner on desktop */}
                <div className="cd-float absolute right-3 top-28 w-20 sm:bottom-7 sm:right-8 sm:top-auto sm:w-44">
                  <div
                    className="cd-cardshine relative -rotate-[7deg]"
                    style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.6))' }}
                  >
                    <Image
                      src="/home/hero/cutouts/CARD.png"
                      alt=""
                      width={1536}
                      height={1024}
                      sizes="190px"
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Amiral Dünya badge — lifted to the top-left corner */}
              <span className="absolute left-8 top-8 z-10 inline-flex items-center gap-2 rounded-full border border-cherie-brass/50 bg-cherie-ink/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-cherie-brass shadow-card backdrop-blur-sm sm:left-10 sm:top-10">
                <span className="text-cherie-brass">
                  <WorldMotif slug={flagship.slug} />
                </span>
                Amiral Dünya
              </span>

              <div className="relative">
                <h3 className="whitespace-pre-line font-display text-4xl leading-[1.05] text-cherie-ivory sm:text-5xl">
                  {flagshipTitle}
                </h3>
                {flagship.description ? (
                  <p className="mt-3 max-w-md text-base leading-7 text-cherie-lace/90">
                    {flagship.description}
                  </p>
                ) : null}
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-cherie-ivory underline-offset-4 group-hover:underline">
                  Dünyayı Aç
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* ── Supporting column ── */}
          <div className="grid gap-5">
            {supporting.map((w, i) => (
              <Reveal key={w.slug} delay={0.1 + i * 0.08}>
                <Link
                  href={`${ROUTES.magaza}/${w.slug}`}
                  className="group relative flex h-full min-h-[12rem] flex-col justify-between overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-ivory p-7 shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1"
                >
                  <div
                    aria-hidden
                    className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cherie-brass/10 blur-2xl transition-opacity duration-card ease-cherie group-hover:opacity-100"
                  />
                  <div className="flex items-start justify-between">
                    <span className="text-cherie-brass">
                      <WorldMotif slug={w.slug} />
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 text-cherie-brass opacity-0 transition-opacity duration-card ease-cherie group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-cherie-ink">{w.name_tr}</h3>
                    {w.description ? (
                      <p className="mt-1.5 text-sm leading-6 text-cherie-soft-ink">
                        {w.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Minor worlds row (smaller scale) ── */}
        {minor.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {minor.map((w, i) => (
              <Reveal key={w.slug} delay={i * 0.08}>
                <Link
                  href={`${ROUTES.magaza}/${w.slug}`}
                  className="group flex items-center gap-4 rounded-card border border-cherie-lace bg-cherie-ivory p-5 shadow-card transition-transform duration-card ease-cherie hover:-translate-y-0.5"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cherie-lace text-cherie-brass transition-colors duration-card ease-cherie group-hover:border-cherie-brass">
                    <WorldMotif slug={w.slug} />
                  </span>
                  <span className="font-display text-lg text-cherie-ink">
                    {w.name_tr}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : null}

        {/* ── Full department marquee (all worlds, discoverable) ── */}
        <Reveal className="mt-14">
          <div className="cd-marquee-track relative overflow-hidden rounded-card border-y border-cherie-lace/70 py-4">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cherie-paper/90 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cherie-paper/90 to-transparent"
            />
            <div className="cd-marquee gap-3">
              {[...departments, ...departments].map((d, i) => (
                <Link
                  key={`${d.slug}-${i}`}
                  href={`${ROUTES.magaza}/${d.slug}`}
                  tabIndex={i < departments.length ? 0 : -1}
                  aria-hidden={i >= departments.length}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-cherie-lace bg-cherie-ivory px-4 text-sm text-cherie-soft-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
                >
                  {d.name_tr}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <Link
            href={ROUTES.magaza}
            className="inline-flex h-11 items-center justify-center rounded-control bg-cherie-burgundy px-7 text-sm font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:bg-cherie-cherry"
          >
            Tüm Mağazayı Gez
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
