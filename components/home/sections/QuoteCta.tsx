'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { ROUTES } from '@/lib/data/routes';

const CHERIE_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * QuoteCta — the narrative close on velvet. The red ribbon returns, draws
 * itself across the panel and ties the final knot around the promise. Three
 * clearly-ranked next actions: request a tailored offer (primary), book an
 * appointment (secondary), enter the store (tertiary text link).
 */
export function QuoteCta() {
  const reduced = useReducedMotion();

  return (
    <section
      data-stage="cta-ribbon"
      className="relative overflow-hidden bg-cherie-velvet py-24 md:py-32"
    >
      {/* warm depth glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-cherie-burgundy/40 blur-3xl" />
        <div className="absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-cherie-cherry/25 blur-3xl" />
      </div>

      {/* returning ribbon: draws in, ties the knot at center */}
      <div aria-hidden className="absolute inset-x-0 top-10">
        <svg
          viewBox="0 0 1200 120"
          fill="none"
          className="mx-auto w-full max-w-5xl"
          preserveAspectRatio="xMidYMid meet"
        >
          <motion.path
            d="M0 60 C 200 60, 300 24, 480 24 C 560 24, 560 96, 600 96 C 640 96, 640 24, 720 24 C 900 24, 1000 60, 1200 60"
            stroke="#8F1D2C"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            transition={{ duration: reduced ? 0 : 2.2, ease: CHERIE_EASE }}
          />
          <motion.circle
            cx="600"
            cy="60"
            r="5"
            fill="#B08A57"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            transition={{ delay: reduced ? 0 : 1.9, duration: 0.5, ease: CHERIE_EASE }}
          />
        </svg>
      </div>

      <div className="cherie-container relative text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-cherie-brass">
          Concierge
        </p>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight text-cherie-ivory md:text-[3.25rem] md:leading-[1.1]">
          Bir fikirle gelin; gerisini birlikte tasarlayalım.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-cherie-lace md:text-lg md:leading-8">
          Davetiyeden organizasyona bütün günü, sizin hikâyenize göre kuralım.
          Size özel teklifiniz 48 saat içinde elinizde.
        </p>

        {/* tiered actions */}
        <div className="mt-10 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* primary */}
            <Link
              href={ROUTES.teklif}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-control bg-cherie-ivory px-8 text-base font-medium text-cherie-burgundy shadow-lift transition-all duration-control ease-cherie hover:-translate-y-0.5 hover:bg-cherie-lace"
            >
              Size Özel Teklif Alın
              <ArrowRight className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:translate-x-1" aria-hidden />
            </Link>
            {/* secondary */}
            <Link
              href={ROUTES.randevu}
              className="inline-flex h-12 items-center justify-center rounded-control border border-cherie-ivory/40 px-7 text-base font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-brass"
            >
              Randevu Al
            </Link>
          </div>
          {/* tertiary */}
          <Link
            href={ROUTES.magaza}
            className="cta-brass text-sm font-medium text-cherie-lace hover:text-cherie-ivory"
          >
            Ya da önce mağazayı gezin
          </Link>
        </div>
      </div>
    </section>
  );
}
