import Link from 'next/link';

import type { ServicePackage } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';
import { StageFrame } from '@/components/home/primitives/StageFrame';

/**
 * OrganizationServices — the staged event scene (reserved "services" stage).
 *
 * Builds a layered ceremony space in CSS/SVG: an arched backdrop and string
 * lights (far), a table horizon with candle glows (mid), and the service
 * cards standing on the stage (near). Phase 4 mounts the short-pinned canvas
 * where the setup assembles on scroll and the ribbon ties the final bow.
 */
export function OrganizationServices({ services }: { services: ServicePackage[] }) {
  return (
    <StageFrame stage="services" className="bg-cherie-velvet">
      {/* ── STAGE SCENERY (behind everything) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* arched backdrop */}
        <ParallaxLayer depth={-4} className="absolute inset-x-0 top-0 flex justify-center">
          <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMin slice" className="h-[120%] w-full opacity-70">
            <defs>
              <linearGradient id="backdrop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3a1620" />
                <stop offset="1" stopColor="#2B1118" />
              </linearGradient>
              <radialGradient id="stageWarm" cx="0.5" cy="0.2" r="0.6">
                <stop offset="0" stopColor="#B08A57" stopOpacity="0.22" />
                <stop offset="1" stopColor="#B08A57" stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* draped arch */}
            <path d="M120 700 Q120 180 600 150 Q1080 180 1080 700 Z" fill="url(#backdrop)" />
            <path d="M120 700 Q120 180 600 150 Q1080 180 1080 700" fill="none" stroke="#B08A57" strokeOpacity="0.25" strokeWidth="2" />
            <rect x="0" y="0" width="1200" height="700" fill="url(#stageWarm)" />
          </svg>
        </ParallaxLayer>

        {/* string lights across the top */}
        <ParallaxLayer depth={3} className="absolute inset-x-0 top-[9%]">
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="h-10 w-full">
            <path d="M0 12 Q300 46 600 22 Q900 46 1200 12" fill="none" stroke="#B08A57" strokeOpacity="0.35" strokeWidth="1" />
            {[80, 240, 400, 560, 720, 880, 1040].map((x, i) => (
              <circle key={x} cx={x} cy={22 + (i % 2) * 10} r="2.5" fill="#B08A57" opacity="0.75" />
            ))}
          </svg>
        </ParallaxLayer>

        {/* table horizon + candle warmth (mid) */}
        <ParallaxLayer depth={-6} className="absolute inset-x-0 bottom-[6%]">
          <div className="mx-auto h-24 w-[86%] rounded-[50%] bg-cherie-ink/40 blur-md" />
        </ParallaxLayer>
        <ParallaxLayer depth={6} className="absolute bottom-[12%] left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-cherie-brass/25 blur-3xl" />
        <ParallaxLayer depth={8} className="absolute bottom-[16%] left-[30%] h-24 w-24 rounded-full bg-cherie-cherry/20 blur-2xl" />
        <ParallaxLayer depth={8} className="absolute bottom-[16%] right-[30%] h-24 w-24 rounded-full bg-cherie-cherry/20 blur-2xl" />
      </div>

      <SectionShell
        eyebrow="Hizmetler"
        title="Gününüzü biz kuralım."
        lede="Organizasyondan filme, dekordan müziğe — sahnenin tamamı tek elden, tek imzayla kurulur."
        className="text-cherie-ivory [&_h2]:text-cherie-ivory [&_p]:text-cherie-lace"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.12}>
              <Link
                href={`${ROUTES.hizmetler}/${service.slug}`}
                className="group relative block h-full overflow-hidden rounded-card border border-cherie-ivory/15 bg-cherie-ink/25 p-7 backdrop-blur-sm transition-all duration-card ease-cherie hover:-translate-y-1.5 hover:border-cherie-brass/50 hover:bg-cherie-ink/40"
              >
                {/* candle glow inside each card — the only glow outside the hero climax */}
                <ParallaxLayer
                  aria-hidden
                  depth={4 + i}
                  className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-cherie-brass/20 opacity-70 blur-2xl transition-opacity duration-card ease-cherie group-hover:opacity-100"
                />
                <div className="h-px w-8 bg-cherie-brass" />
                <h3 className="mt-5 font-display text-2xl text-cherie-ivory">{service.name}</h3>
                {service.summary ? (
                  <p className="mt-3 text-sm leading-6 text-cherie-lace/90">{service.summary}</p>
                ) : null}
                <span className="mt-6 inline-block text-sm font-medium text-cherie-brass underline-offset-4 group-hover:underline">
                  Detayları Gör
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex flex-wrap gap-4">
          <Link
            href={ROUTES.teklif}
            className="inline-flex h-11 items-center justify-center rounded-control bg-cherie-ivory px-6 text-sm font-medium text-cherie-burgundy transition-colors duration-control ease-cherie hover:bg-cherie-lace"
          >
            Teklif Al
          </Link>
          <Link
            href={ROUTES.randevu}
            className="inline-flex h-11 items-center justify-center rounded-control border border-cherie-ivory/40 px-6 text-sm font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-brass"
          >
            Randevu Al
          </Link>
        </Reveal>
      </SectionShell>
    </StageFrame>
  );
}
