'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, ArrowUpRight, Truck } from 'lucide-react';

import type { ServiceCity } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';

const CHERIE_EASE = [0.22, 1, 0.36, 1] as const;
const CYCLE_MS = 2600;

/**
 * Real border of Türkiye (Natural Earth, [lon, lat] rings): the Anatolian
 * mainland and the Thrace peninsula as two polygons — so the Bosphorus/Marmara
 * gap reads correctly. Projected here with the exact same equirectangular
 * transform as the city coordinates, so silhouette and pins share one system.
 */
const RING_ANATOLIA: [number, number][] = [
  [36.913, 41.335],
  [38.348, 40.949],
  [39.513, 41.103],
  [40.373, 41.014],
  [41.554, 41.536],
  [42.62, 41.583],
  [43.583, 41.092],
  [43.753, 40.74],
  [43.656, 40.254],
  [44.4, 40.005],
  [44.794, 39.713],
  [44.109, 39.428],
  [44.421, 38.281],
  [44.226, 37.972],
  [44.773, 37.17],
  [44.293, 37.002],
  [43.942, 37.256],
  [42.779, 37.385],
  [42.35, 37.23],
  [41.212, 37.074],
  [40.673, 37.091],
  [39.523, 36.716],
  [38.7, 36.713],
  [38.168, 36.901],
  [37.067, 36.623],
  [36.739, 36.818],
  [36.685, 36.26],
  [36.418, 36.041],
  [36.15, 35.822],
  [35.782, 36.275],
  [36.161, 36.651],
  [35.551, 36.565],
  [34.715, 36.796],
  [34.027, 36.22],
  [32.509, 36.108],
  [31.7, 36.644],
  [30.622, 36.678],
  [30.391, 36.263],
  [29.7, 36.144],
  [28.733, 36.677],
  [27.641, 36.659],
  [27.049, 37.653],
  [26.318, 38.208],
  [26.805, 38.986],
  [26.171, 39.464],
  [27.28, 40.42],
  [28.82, 40.46],
  [29.24, 41.22],
  [31.146, 41.088],
  [32.348, 41.736],
  [33.513, 42.019],
  [35.168, 42.04],
  [36.913, 41.335],
];
const RING_THRACE: [number, number][] = [
  [27.192, 40.691],
  [26.358, 40.152],
  [26.043, 40.618],
  [26.057, 40.824],
  [26.295, 40.936],
  [26.604, 41.562],
  [26.117, 41.827],
  [27.136, 42.141],
  [27.997, 42.007],
  [28.116, 41.623],
  [28.988, 41.3],
  [28.806, 41.055],
  [27.619, 41.0],
  [27.192, 40.691],
];

/** Real city coordinates [lon, lat] (coastal ones nudged just inland). */
const CITY_GEO: Record<string, [number, number]> = {
  istanbul: [28.98, 41.05],
  ankara: [32.85, 39.93],
  izmir: [27.3, 38.46],
  bursa: [29.1, 40.2],
  antalya: [30.79, 37.0],
  adana: [35.32, 37.05],
  mersin: [34.64, 36.92],
  bodrum: [27.58, 37.1],
};

/** Label placement per city to avoid collisions. */
const LABELS: Record<
  string,
  { anchor: 'start' | 'middle' | 'end'; dx: number; dy: number }
> = {
  istanbul: { anchor: 'middle', dx: 0, dy: -14 },
  ankara: { anchor: 'middle', dx: 0, dy: -14 },
  izmir: { anchor: 'end', dx: -12, dy: 4 },
  bursa: { anchor: 'start', dx: 10, dy: 20 },
  antalya: { anchor: 'middle', dx: 0, dy: 22 },
  adana: { anchor: 'start', dx: 11, dy: -8 },
  mersin: { anchor: 'end', dx: -11, dy: 16 },
  bodrum: { anchor: 'end', dx: -11, dy: 6 },
};

// ---- Equirectangular projection shared by border + cities ----
const LON_MIN = 26.04;
const LAT_MAX = 42.16;
const COS_LAT = Math.cos((39 * Math.PI) / 180);
const SCALE = 61;
const PAD = 26;

function raw(lon: number, lat: number): [number, number] {
  return [(lon - LON_MIN) * COS_LAT * SCALE, (LAT_MAX - lat) * SCALE];
}
const ALL = [...RING_ANATOLIA, ...RING_THRACE].map(([lo, la]) => raw(lo, la));
const MIN_X = Math.min(...ALL.map((p) => p[0]));
const MIN_Y = Math.min(...ALL.map((p) => p[1]));
const VIEW_W = Math.round(Math.max(...ALL.map((p) => p[0])) - MIN_X + PAD * 2);
const VIEW_H = Math.round(Math.max(...ALL.map((p) => p[1])) - MIN_Y + PAD * 2);

function project(lon: number, lat: number): [number, number] {
  const [x, y] = raw(lon, lat);
  return [x - MIN_X + PAD, y - MIN_Y + PAD];
}
function ringPath(ring: [number, number][]): string {
  return (
    ring
      .map(([lo, la], i) => {
        const [x, y] = project(lo, la);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ') + ' Z'
  );
}
const PATH_ANATOLIA = ringPath(RING_ANATOLIA);
const PATH_THRACE = ringPath(RING_THRACE);

const HEARTS = [
  { left: '18%', dur: '8.5s', delay: '0s', size: 16, peak: 0.5 },
  { left: '34%', dur: '10.5s', delay: '1.6s', size: 22, peak: 0.4 },
  { left: '52%', dur: '9s', delay: '3.2s', size: 14, peak: 0.55 },
  { left: '66%', dur: '11s', delay: '0.8s', size: 20, peak: 0.35 },
  { left: '78%', dur: '9.8s', delay: '2.4s', size: 15, peak: 0.45 },
  { left: '44%', dur: '12s', delay: '4.4s', size: 18, peak: 0.3 },
];

const TRAVEL_LABEL: Record<string, string> = {
  none: 'Ulaşım dahil',
  fixed: 'Sabit ulaşım katkısı',
  per_km: 'Mesafeye göre ulaşım',
  quote: 'Ulaşım teklife göre',
};

function Heart({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 21c-1-.9-8-6.2-8-11.5C4 6.4 6.2 4.5 8.8 4.5c1.7 0 3.2.9 3.2 2.3 0-1.4 1.5-2.3 3.2-2.3 2.6 0 4.8 1.9 4.8 5C20 14.8 13 20.1 12 21z" />
    </svg>
  );
}

export function TurkeyMap({ cities }: { cities: ServiceCity[] }) {
  const reduced = useReducedMotion();
  const titleId = useId();
  const placed = cities.filter((c) => CITY_GEO[c.city_slug]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-cycle the active city (map node + card) to draw the eye.
  useEffect(() => {
    if (reduced || paused || placed.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % placed.length),
      CYCLE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced, paused, placed.length]);

  if (!placed.length) return null;
  const active = placed[index % placed.length]!;

  const selectBySlug = (slug: string) => {
    const i = placed.findIndex((c) => c.city_slug === slug);
    if (i >= 0) setIndex(i);
  };

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid items-center gap-10 lg:grid-cols-[1.618fr_1fr] lg:gap-14">
        {/* ── The map ── */}
        <figure className="relative">
          <figcaption id={titleId} className="sr-only">
            Türkiye yerinde hizmet haritası — bir şehir seçin
          </figcaption>
          <div className="cd-grain relative overflow-hidden rounded-card-lg border border-cherie-lace bg-gradient-to-br from-cherie-ivory via-cherie-paper to-cherie-mist p-4 shadow-card sm:p-8">
            {/* floating love-hearts */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {HEARTS.map((h, i) => (
                <span
                  key={i}
                  className="cd-heart"
                  style={
                    {
                      left: h.left,
                      '--dur': h.dur,
                      '--delay': h.delay,
                      '--peak': h.peak,
                    } as React.CSSProperties
                  }
                >
                  <Heart size={h.size} color={i % 2 ? '#b08a57' : '#8f1d2c'} />
                </span>
              ))}
            </div>

            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              role="group"
              aria-labelledby={titleId}
              className="relative h-auto w-full"
            >
              <defs>
                <linearGradient id="tr-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f3ede3" />
                  <stop offset="1" stopColor="#e8d8c7" />
                </linearGradient>
              </defs>

              {[PATH_ANATOLIA, PATH_THRACE].map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill="url(#tr-fill)"
                  stroke="#b08a57"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0.2 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                  transition={{ duration: reduced ? 0 : 2, ease: CHERIE_EASE }}
                />
              ))}

              {/* city nodes — focusable, keyboard + pointer operable */}
              {placed.map((c) => {
                const [x, y] = project(...CITY_GEO[c.city_slug]!);
                const label = LABELS[c.city_slug] ?? {
                  anchor: 'middle' as const,
                  dx: 0,
                  dy: -14,
                };
                const selected = c.city_slug === active.city_slug;
                return (
                  <g
                    key={c.city_slug}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    aria-label={`${c.city_name} hizmet bölgesi`}
                    className="cursor-pointer focus:outline-none [&:focus-visible>circle.ring]:opacity-100"
                    onClick={() => selectBySlug(c.city_slug)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectBySlug(c.city_slug);
                      }
                    }}
                  >
                    <circle cx={x} cy={y} r="22" fill="transparent" />
                    {selected && (
                      <>
                        <circle
                          className="cd-node-ping"
                          cx={x}
                          cy={y}
                          r="6"
                          fill="none"
                          stroke="#8f1d2c"
                          strokeWidth="2"
                        />
                        <circle
                          className="cd-node-halo"
                          cx={x}
                          cy={y}
                          r="8"
                          fill="#8f1d2c"
                          opacity="0.45"
                        />
                      </>
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={selected ? 6 : 4.5}
                      fill={selected ? '#8f1d2c' : '#faf7f1'}
                      stroke="#8f1d2c"
                      strokeWidth="1.8"
                    />
                    <circle
                      className="pointer-events-none opacity-0 ring"
                      cx={x}
                      cy={y}
                      r="12"
                      fill="none"
                      stroke="#7f5a2d"
                      strokeWidth="2"
                    />
                    <text
                      x={x + label.dx}
                      y={y + label.dy}
                      textAnchor={label.anchor}
                      className={`pointer-events-none font-ui text-[13px] ${selected ? 'fill-cherie-burgundy font-semibold' : 'fill-cherie-ink font-medium'}`}
                      style={{ fontSize: 13 }}
                    >
                      {c.city_name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* touch chip row (mobile-first, always visible) */}
          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {placed.map((c) => (
              <button
                key={c.city_slug}
                type="button"
                onClick={() => selectBySlug(c.city_slug)}
                aria-pressed={c.city_slug === active.city_slug}
                className={`min-h-11 rounded-control border px-4 text-sm font-medium transition-colors duration-control ease-cherie ${
                  c.city_slug === active.city_slug
                    ? 'border-cherie-burgundy bg-cherie-burgundy text-cherie-ivory'
                    : 'border-cherie-lace bg-cherie-ivory text-cherie-ink'
                }`}
              >
                {c.city_name}
              </button>
            ))}
          </div>
        </figure>

        {/* ── Selected-city ledger (auto-updates with the cycle) ── */}
        <div aria-live="polite" className="relative">
          <motion.div
            key={active.city_slug}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.5, ease: CHERIE_EASE }}
            className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-8 shadow-card"
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cherie-brass">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> Hizmet Bölgesi
            </span>
            <h3 className="mt-4 font-display text-4xl text-cherie-ink">
              {active.city_name}
            </h3>
            <p className="mt-3 text-base leading-7 text-cherie-soft-ink">
              {active.notes_tr}
            </p>

            <dl className="mt-6 border-t border-cherie-lace pt-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-cherie-soft-ink">Ulaşım</dt>
                <dd className="font-medium text-cherie-ink">
                  {TRAVEL_LABEL[active.travel_fee_model] ?? 'Teklife göre'}
                </dd>
              </div>
            </dl>

            <Link
              href={`${ROUTES.hizmetlerSehir}/${active.city_slug}`}
              className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-control bg-cherie-burgundy px-6 text-sm font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:bg-cherie-cherry"
            >
              {active.city_name} Hizmetleri
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </motion.div>

          <p className="mt-5 text-sm leading-6 text-cherie-soft-ink">
            Şehriniz listede yok mu?{' '}
            <Link
              href={ROUTES.iletisim}
              className="cta-brass inline-flex min-h-11 items-center font-medium text-cherie-burgundy"
            >
              Bize yazın
            </Link>
            , yol haritanızı birlikte çıkaralım.
          </p>
        </div>
      </div>

      {/* ── Delivery-everywhere banner ── */}
      <div className="relative mt-12 overflow-hidden rounded-card-lg border border-cherie-brass/40 bg-gradient-to-br from-cherie-ivory to-cherie-paper/70 shadow-card">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cherie-brass/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          {/* animated delivery scene: truck drives a scrolling road to a pin */}
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-cherie-burgundy text-cherie-ivory shadow-lift">
              <Truck className="cd-truck h-8 w-8" strokeWidth={1.5} aria-hidden />
            </span>
            <span
              aria-hidden
              className="cd-road h-[3px] w-9 text-cherie-brass/70 sm:w-14"
            />
            <MapPin className="cd-pin-pop h-6 w-6 text-cherie-cherry" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-display text-xl leading-snug text-cherie-ink sm:text-[1.6rem]">
              Kargo ile teslimat, Türkiye’nin{' '}
              <span className="text-cherie-burgundy">her yerine</span>.
            </p>
            <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
              Davetiye, hediyelik ve tüm ürünlerimiz{' '}
              <span className="font-medium text-cherie-ink">her ile</span> ulaşır. Bu
              harita yalnızca{' '}
              <span className="font-medium text-cherie-ink">
                yerinde kurulum ve organizasyon
              </span>{' '}
              hizmetlerimizin verildiği şehirleri gösterir.
            </p>
          </div>

          <span className="hidden shrink-0 flex-col items-center rounded-card border border-cherie-brass/40 bg-cherie-ivory px-5 py-3 text-center shadow-card lg:flex">
            <span className="font-display text-3xl leading-none text-cherie-burgundy">
              81
            </span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cherie-brass">
              İl
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
