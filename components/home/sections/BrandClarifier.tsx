import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ROUTES } from '@/lib/data/routes';
import { Reveal } from '@/components/home/primitives/Reveal';

const DOMAINS = [
  {
    index: '01',
    title: 'Ürünler',
    description:
      'Davetiyeden nikâh şekerine, mühürden kurdeleye — elinizde kalan her detay.',
    href: ROUTES.magaza,
    cta: 'Mağaza',
  },
  {
    index: '02',
    title: 'Hizmetler',
    description:
      'Organizasyondan filme, dekordan müziğe — gününüzü baştan sona kuran ekip.',
    href: ROUTES.hizmetler,
    cta: 'Hizmetler',
  },
  {
    index: '03',
    title: 'Hatıra',
    description:
      'Albümden dijital anıya — gün bittiğinde geriye kalan her şey, özenle saklanır.',
    href: ROUTES.hatira,
    cta: 'Hatıra',
  },
] as const;

/**
 * BrandClarifier — the exhale after the hero. Answers "CHERIE DAY nedir?" in
 * seconds with one dominant statement (61.8%) and an asymmetric three-row
 * domain ledger (38.2%) — deliberately not three equal pillar cards.
 */
export function BrandClarifier() {
  return (
    <section className="relative overflow-hidden border-t border-cherie-cherry/60 bg-cherie-ivory py-20 md:py-28">
      <span
        aria-hidden
        className="cd-ghost-index pointer-events-none absolute -right-6 -top-10 hidden select-none text-[12rem] md:block"
      >
        CD
      </span>

      <div className="cherie-container grid gap-12 lg:grid-cols-[1.618fr_1fr] lg:items-center">
        {/* dominant statement */}
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-cherie-brass">
            Maison
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-4xl leading-[1.12] text-cherie-ink md:text-[3.25rem] md:leading-[1.08]">
            Bir mağaza değil; özel gününüzün{' '}
            <span className="text-cherie-burgundy">tamamını üstlenen</span> bir maison.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-cherie-soft-ink">
            İlk sözden son dansa kadar; ürün, hizmet ve hatıra aynı imzanın üç
            hâlidir. Siz gününüzü yaşarsınız — hazırlığın telaşını biz taşırız.
          </p>
          <div className="cd-rule mt-8 w-40" />
        </Reveal>

        {/* domain ledger */}
        <Reveal delay={0.12}>
          <ul className="divide-y divide-cherie-lace border-y border-cherie-lace">
            {DOMAINS.map((d) => (
              <li key={d.title}>
                <Link
                  href={d.href}
                  className="group flex items-center gap-5 py-6 transition-colors duration-card ease-cherie hover:bg-cherie-paper/40"
                >
                  <span className="cd-ghost-index shrink-0 text-4xl leading-none">
                    {d.index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-2xl text-cherie-ink">{d.title}</span>
                      <ArrowRight className="h-4 w-4 -translate-x-1 text-cherie-brass opacity-0 transition-all duration-card ease-cherie group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-cherie-soft-ink">
                      {d.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
