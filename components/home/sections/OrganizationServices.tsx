import Link from 'next/link';
import { ArrowRight, MoveRight } from 'lucide-react';

import type { ServicePackage } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';
import { StageFrame } from '@/components/home/primitives/StageFrame';

/** Bare venue silhouette (cool, sparse). */
function EmptyVenue() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill="#2b2530" opacity="0.35" />
      <path d="M60 200 Q60 70 150 60 Q240 70 240 200" fill="none" stroke="#6b6470" strokeWidth="1.4" strokeOpacity="0.5" />
      <line x1="0" y1="150" x2="300" y2="150" stroke="#6b6470" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  );
}

/** Prepared day silhouette (warm, lit, set). */
function PreparedDay() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="warm" cx="0.5" cy="0.25" r="0.7">
          <stop offset="0" stopColor="#B08A57" stopOpacity="0.4" />
          <stop offset="1" stopColor="#B08A57" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="200" fill="#3a1620" />
      <rect width="300" height="200" fill="url(#warm)" />
      <path d="M60 200 Q60 70 150 60 Q240 70 240 200" fill="none" stroke="#B08A57" strokeWidth="1.6" strokeOpacity="0.6" />
      {/* string lights */}
      <path d="M40 66 Q150 96 260 66" fill="none" stroke="#B08A57" strokeWidth="1" strokeOpacity="0.5" />
      {[52, 92, 132, 150, 168, 208, 248].map((x, i) => (
        <circle key={x} cx={x} cy={78 + (i % 2) * 8} r="2.4" fill="#ffd68c" opacity="0.9" />
      ))}
      {/* set table */}
      <rect x="96" y="150" width="108" height="10" rx="2" fill="#faf7f1" opacity="0.85" />
      <ellipse cx="150" cy="150" rx="70" ry="6" fill="#000" opacity="0.25" />
      {[116, 138, 162, 184].map((x) => (
        <circle key={x} cx={x} cy="150" r="4" fill="#8f1d2c" opacity="0.8" />
      ))}
    </svg>
  );
}

export function OrganizationServices({ services }: { services: ServicePackage[] }) {
  return (
    <StageFrame stage="services" className="bg-cherie-velvet">
      <SectionShell
        eyebrow="Hizmetler"
        title="Boş bir mekân verin; hazır bir gün alın."
        lede="Organizasyondan filme, dekordan müziğe — sahnenin tamamını tek elden, tek imzayla kuruyoruz."
        className="text-cherie-ivory [&_h2]:text-cherie-ivory [&_p]:text-cherie-lace"
      >
        {/* before → after transform */}
        <Reveal>
          <div className="grid overflow-hidden rounded-card-lg border border-cherie-brass/25 shadow-lift sm:grid-cols-[1fr_auto_1fr]">
            <figure className="relative">
              <div className="aspect-[3/2] w-full">
                <EmptyVenue />
              </div>
              <figcaption className="absolute left-4 top-4 rounded-full bg-cherie-ink/50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cherie-lace backdrop-blur-sm">
                Önce · Boş sahne
              </figcaption>
            </figure>

            <div className="grid place-items-center bg-cherie-velvet px-4 py-4 sm:px-6">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-cherie-brass/50 text-cherie-brass">
                <MoveRight className="h-5 w-5" aria-hidden />
              </span>
            </div>

            <figure className="relative">
              <div className="aspect-[3/2] w-full">
                <PreparedDay />
              </div>
              <figcaption className="absolute left-4 top-4 rounded-full bg-cherie-cherry/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cherie-ivory backdrop-blur-sm">
                Sonra · Kurulmuş gün
              </figcaption>
            </figure>
          </div>
        </Reveal>

        {/* service packages */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.1}>
              <Link
                href={`${ROUTES.hizmetler}/${service.slug}`}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-card-lg border border-cherie-ivory/15 bg-cherie-ink/25 p-7 backdrop-blur-sm transition-all duration-card ease-cherie hover:-translate-y-1.5 hover:border-cherie-brass/50 hover:bg-cherie-ink/40"
              >
                <div aria-hidden className="cd-sheen opacity-40" />
                <div className="relative">
                  <div className="h-px w-8 bg-cherie-brass" />
                  <h3 className="mt-5 font-display text-2xl text-cherie-ivory">{service.name}</h3>
                  {service.summary ? (
                    <p className="mt-3 text-sm leading-6 text-cherie-lace/90">{service.summary}</p>
                  ) : null}
                </div>
                <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-cherie-brass underline-offset-4 group-hover:underline">
                  Detayları Gör
                  <ArrowRight className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:translate-x-1" aria-hidden />
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
