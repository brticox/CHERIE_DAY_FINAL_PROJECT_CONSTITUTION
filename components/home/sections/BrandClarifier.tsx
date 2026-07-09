import Link from 'next/link';

import { ROUTES } from '@/lib/data/routes';
import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';

const PILLARS = [
  {
    title: 'Ürünler',
    description:
      'Davetiyeden nikah şekerine, mühürden kurdeleye — elinizde tutacağınız her detay.',
    href: ROUTES.magaza,
    cta: 'Mağazayı Gez',
  },
  {
    title: 'Hizmetler',
    description:
      'Organizasyondan filme, dekordan müziğe — gününüzü baştan sona kuran ekip.',
    href: ROUTES.hizmetler,
    cta: 'Hizmetleri Gör',
  },
  {
    title: 'Hatıra',
    description:
      'Albümden dijital anıya — gün bittiğinde geriye kalan her şey, özenle saklanır.',
    href: ROUTES.hatira,
    cta: 'Hatırayı Keşfet',
  },
] as const;

/**
 * BrandClarifier — the exhale after the hero: "maison, not marketplace" in
 * three pillars. The ribbon hands off here as the section's top border.
 */
export function BrandClarifier() {
  return (
    <section className="relative border-t-2 border-cherie-cherry/70 bg-cherie-ivory py-20 md:py-28">
      <div className="cherie-container">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cherie-brass">
            Maison
          </p>
          <h2 className="mt-4 max-w-2xl text-h2 text-cherie-ink">
            Bir sözden bütün bir güne, tek çatı.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-cherie-soft-ink md:text-lg md:leading-8">
            CHERIE DAY bir mağaza değil; özel gününüzün tamamını üstlenen bir
            maison. Ürün, hizmet ve hatıra — aynı imzanın üç hâli.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.12}>
              <Link
                href={pillar.href}
                className="group relative block h-full overflow-hidden rounded-card border border-cherie-lace bg-cherie-paper/60 p-8 shadow-card transition-transform duration-card ease-cherie hover:-translate-y-1"
              >
                {/* floating object shadow: quiet depth behind each pillar */}
                <ParallaxLayer
                  aria-hidden
                  depth={4 + i * 2}
                  className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cherie-brass/10 blur-2xl"
                />
                <div className="h-px w-10 bg-cherie-brass" />
                <h3 className="mt-6 text-h3 text-cherie-ink">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-cherie-soft-ink">
                  {pillar.description}
                </p>
                <span className="mt-6 inline-block text-sm font-medium text-cherie-burgundy underline-offset-4 group-hover:underline">
                  {pillar.cta}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
