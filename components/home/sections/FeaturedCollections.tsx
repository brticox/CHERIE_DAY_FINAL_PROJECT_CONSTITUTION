import Link from 'next/link';

import type { Collection } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * FeaturedCollections — coordinated worlds under one identity.
 * Palette-driven editorial cards; the ribbon shifts hue per collection
 * (represented here by each collection's own palette dots and accent rule).
 */
export function FeaturedCollections({ collections }: { collections: Collection[] }) {
  return (
    <SectionShell
      eyebrow="Koleksiyonlar"
      title="Bir arada tasarlanmış dünyalar"
      lede="Davetiye, mühür, kurdele, hediye — tek bir kimlik altında, birbirini tamamlayan setler."
      className="bg-cherie-ivory"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {collections.map((collection, i) => {
          const accent = collection.palette[0] ?? '#8F1D2C';
          return (
            <Reveal key={collection.slug} delay={i * 0.12}>
              <Link
                href={`${ROUTES.koleksiyonlar}/${collection.slug}`}
                className="group block h-full overflow-hidden rounded-card border border-cherie-lace bg-cherie-paper/50 shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1"
              >
                {/* palette field — collection's own world color, inside its surface only */}
                <div
                  aria-hidden
                  className="relative aspect-[16/9] w-full overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${accent} 0%, ${collection.palette[1] ?? '#FAF7F1'} 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-cherie-ink/5 transition-colors duration-card ease-cherie group-hover:bg-transparent" />
                  {/* ribbon accent takes the collection's hue */}
                  <div
                    aria-hidden
                    className="absolute inset-x-8 bottom-6 h-px opacity-80"
                    style={{ backgroundColor: collection.palette[2] ?? '#B08A57' }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-2xl text-cherie-ink">
                      {collection.name}
                    </h3>
                    <div className="flex gap-1.5" aria-hidden>
                      {collection.palette.slice(0, 3).map((hex) => (
                        <span
                          key={hex}
                          className="h-3 w-3 rounded-full border border-cherie-ink/10"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                  {collection.story ? (
                    <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">
                      {collection.story}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-block text-sm font-medium text-cherie-burgundy underline-offset-4 group-hover:underline">
                    Koleksiyonu Gör
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
