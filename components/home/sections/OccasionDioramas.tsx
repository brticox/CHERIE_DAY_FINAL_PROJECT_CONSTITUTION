import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { OccasionTile } from '@/lib/home/home-data';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/** Per-occasion tonal scene (token palette only). */
const SCENES: Record<string, string> = {
  isteme: 'from-cherie-lace/80 via-cherie-paper to-cherie-mist',
  'nisan-soz': 'from-cherie-mist via-cherie-paper to-cherie-lace/70',
  nikah: 'from-cherie-paper via-cherie-ivory to-cherie-lace/60',
  dugun: 'from-cherie-burgundy via-cherie-velvet to-cherie-velvet',
};

/**
 * OccasionDioramas — the ceremony arc. Three quiet lead-up rites (İsteme →
 * Söz/Nişan → Nikah) build across the top; the Düğün flagship anchors the
 * bottom at full width. Deliberately asymmetric — no equal four-card row.
 */
export function OccasionDioramas({ occasions }: { occasions: OccasionTile[] }) {
  if (!occasions.length) return null;
  const flagship = occasions[occasions.length - 1]!;
  const lead = occasions.slice(0, -1);

  return (
    <SectionShell
      eyebrow="Deneyimler"
      title="Hangi gününüz için buradasınız?"
      lede="İlk istemeden düğün gecesine — her tören kendi dünyasını, kendi zarafetini taşır."
      className="bg-cherie-ivory"
    >
      {/* lead-up rites */}
      <div className="grid gap-5 sm:grid-cols-3">
        {lead.map((o, i) => (
          <Reveal key={o.slug} delay={i * 0.1}>
            <Link
              href={o.href}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-card-lg border border-cherie-lace shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1.5"
            >
              <div
                className={`cd-grain absolute inset-0 bg-gradient-to-b ${SCENES[o.slug] ?? SCENES.isteme}`}
              />
              {/* threshold hairline */}
              <div
                aria-hidden
                className="absolute inset-x-6 top-[42%] h-px bg-cherie-cherry/40 transition-colors duration-card ease-cherie group-hover:bg-cherie-cherry"
              />
              <span
                aria-hidden
                className="absolute left-6 top-6 font-display text-sm tracking-[0.3em] text-cherie-brass"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative bg-gradient-to-t from-cherie-ivory via-cherie-ivory/92 to-transparent p-6 pt-14">
                <h3 className="font-display text-2xl text-cherie-ink">{o.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-cherie-soft-ink">
                  {o.summary}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Düğün flagship */}
      <Reveal delay={0.15} className="mt-5">
        <Link
          href={flagship.href}
          className="group relative flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-card-lg border border-cherie-lace text-cherie-ivory shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1"
        >
          <div
            className={`cd-grain absolute inset-0 bg-gradient-to-br ${SCENES[flagship.slug] ?? SCENES.dugun}`}
          />
          <div aria-hidden className="absolute inset-0">
            <div className="cd-sheen" />
            <div className="m-vignette" />
          </div>
          <div className="relative max-w-2xl p-8 sm:p-12">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-cherie-brass">
              Büyük Gün
            </span>
            <h3 className="mt-3 font-display text-4xl leading-tight text-cherie-ivory sm:text-5xl">
              {flagship.name}
            </h3>
            <p className="mt-3 max-w-lg text-base leading-7 text-cherie-lace/90">
              {flagship.summary}
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 group-hover:underline">
              Düğün Dünyasına Gir
              <ArrowUpRight className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </span>
          </div>
        </Link>
      </Reveal>
    </SectionShell>
  );
}
