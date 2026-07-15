import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { Collection } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

function PaletteSwatches({ palette }: { palette: string[] }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {palette.slice(0, 3).map((hex) => (
        <span
          key={hex}
          className="h-3.5 w-3.5 rounded-full border border-cherie-ivory/50 shadow-sm"
          style={{ backgroundColor: hex }}
        />
      ))}
    </div>
  );
}

/**
 * FeaturedCollections — coordinated worlds under one identity, told as
 * editorial mood cards driven by each collection's real palette. The lead
 * collection takes a dominant 61.8% panel; the rest stack beside it.
 */
export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  const lead = collections[0];
  if (!lead) return null;
  const rest = collections.slice(1, 3);
  const leadAccent = lead.palette[0] ?? '#8F1D2C';

  return (
    <SectionShell
      eyebrow="Koleksiyonlar"
      title="Bir arada tasarlanmış dünyalar"
      lede="Davetiye, mühür, kurdele, hediye — tek bir renk dünyası altında, birbirini tamamlayan setler."
      className="bg-cherie-ivory"
    >
      <div className="grid gap-5 lg:grid-cols-[1.618fr_1fr]">
        {/* lead collection */}
        <Reveal>
          <Link
            href={`${ROUTES.koleksiyonlar}/${lead.slug}`}
            className="group relative flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-card-lg border border-cherie-lace shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1"
          >
            <div
              aria-hidden
              className="cd-grain absolute inset-0"
              style={{
                background: `linear-gradient(150deg, ${leadAccent} 0%, ${lead.palette[1] ?? '#2B1118'} 55%, ${lead.palette[2] ?? '#B08A57'} 100%)`,
              }}
            />
            <div aria-hidden className="cd-sheen" />
            <div className="absolute inset-0 bg-cherie-ink/15" aria-hidden />
            <div className="relative p-8 text-cherie-ivory sm:p-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-cherie-ivory/80">
                  Öne çıkan koleksiyon
                </span>
                <PaletteSwatches palette={lead.palette} />
              </div>
              <h3 className="mt-4 font-display text-4xl text-cherie-ivory sm:text-5xl">{lead.name}</h3>
              {lead.story ? (
                <p className="mt-3 max-w-md text-base leading-7 text-cherie-ivory/85">
                  {lead.story}
                </p>
              ) : null}
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 group-hover:underline">
                Koleksiyonu Aç
                <ArrowUpRight className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </span>
            </div>
          </Link>
        </Reveal>

        {/* supporting collections */}
        <div className="grid gap-5">
          {rest.map((collection, i) => {
            const accent = collection.palette[0] ?? '#8F1D2C';
            return (
              <Reveal key={collection.slug} delay={0.1 + i * 0.08}>
                <Link
                  href={`${ROUTES.koleksiyonlar}/${collection.slug}`}
                  className="group flex h-full overflow-hidden rounded-card-lg border border-cherie-lace bg-cherie-paper/50 shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1"
                >
                  <div
                    aria-hidden
                    className="w-24 shrink-0"
                    style={{
                      background: `linear-gradient(160deg, ${accent} 0%, ${collection.palette[1] ?? '#FAF7F1'} 100%)`,
                    }}
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-2xl text-cherie-ink">{collection.name}</h3>
                        <PaletteSwatches palette={collection.palette} />
                      </div>
                      {collection.story ? (
                        <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
                          {collection.story}
                        </p>
                      ) : null}
                    </div>
                    <span className="mt-4 inline-block text-sm font-medium text-cherie-burgundy underline-offset-4 group-hover:underline">
                      Koleksiyonu Gör
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
