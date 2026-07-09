import Link from 'next/link';

import type { ServiceCity } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * CityAvailability — "Şehrinizde CHERIE DAY var mı?"
 * An abstract ivory map field with brass city pins at approximate positions;
 * pins float at slightly different depths, a faint ribbon thread links them.
 */
const PIN_POSITIONS: Record<string, { left: string; top: string }> = {
  istanbul: { left: '22%', top: '26%' },
  ankara: { left: '48%', top: '42%' },
  izmir: { left: '10%', top: '56%' },
  bursa: { left: '28%', top: '38%' },
  antalya: { left: '38%', top: '74%' },
  adana: { left: '62%', top: '70%' },
};

export function CityAvailability({ cities }: { cities: ServiceCity[] }) {
  return (
    <SectionShell
      eyebrow="Şehir Hizmetleri"
      title="Şehrinizde CHERIE DAY var mı?"
      lede="Hizmetlerimiz şehir şehir planlanır; ulaşım ve kurulum koşulları netçe paylaşılır."
      className="bg-cherie-paper/40"
    >
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* — abstract map field — */}
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-cherie-lace bg-gradient-to-br from-cherie-ivory to-cherie-mist shadow-card">
            {/* faint ribbon thread linking the pins */}
            <svg
              aria-hidden
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full opacity-30"
            >
              <path
                d="M22 26 L28 38 L48 42 L62 70 L38 74 L10 56 L28 38"
                fill="none"
                stroke="#8F1D2C"
                strokeWidth="0.35"
                strokeDasharray="1.5 2"
              />
            </svg>
            {cities.map((city, i) => {
              const pos = PIN_POSITIONS[city.city_slug] ?? { left: '50%', top: '50%' };
              return (
                <ParallaxLayer
                  key={city.city_slug}
                  depth={3 + (i % 3) * 2}
                  className="absolute"
                >
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: 0, top: 0 }}
                  />
                  <div
                    className="group absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
                    style={pos}
                  >
                    <span className="rounded-control border border-cherie-lace bg-cherie-ivory px-2 py-0.5 text-[11px] font-medium text-cherie-ink shadow-card">
                      {city.city_name}
                    </span>
                    <span aria-hidden className="mt-1 h-2 w-2 rounded-full border-2 border-cherie-brass bg-cherie-ivory" />
                  </div>
                </ParallaxLayer>
              );
            })}
          </div>
        </Reveal>

        {/* — city list + CTA — */}
        <Reveal delay={0.15}>
          <ul className="divide-y divide-cherie-lace border-y border-cherie-lace">
            {cities.map((city) => (
              <li key={city.city_slug} className="flex items-center justify-between gap-4 py-4">
                <span className="font-display text-xl text-cherie-ink">{city.city_name}</span>
                <span className="text-xs text-cherie-soft-ink">{city.notes_tr}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href={ROUTES.hizmetlerSehir}
              className="inline-flex h-11 items-center justify-center rounded-control border border-cherie-burgundy px-6 text-sm font-medium text-cherie-burgundy transition-colors duration-control ease-cherie hover:bg-cherie-ivory"
            >
              Şehrimde Hizmet Var mı?
            </Link>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
