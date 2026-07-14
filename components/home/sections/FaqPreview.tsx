import Link from 'next/link';
import { MessageCircleHeart, ArrowRight } from 'lucide-react';

import type { Faq } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * FaqPreview — the calm concierge close before the footer. A few questions
 * answered gently, beside a warm "talk to a person" panel. Reuses the existing
 * accessible accordion.
 */
export function FaqPreview({ faqs }: { faqs: Faq[] }) {
  return (
    <SectionShell
      eyebrow="Sorular"
      title="Aklınıza takılanlar, sakince"
      lede="Teslimattan tasarım onayına kadar en çok merak edilenler; gerisi için hep bir insan bir tık uzağınızda."
      className="bg-cherie-paper/40"
    >
      <div className="grid gap-10 lg:grid-cols-[1.618fr_1fr]">
        <Reveal>
          <FaqAccordion faqs={faqs} />
        </Reveal>
        <Reveal delay={0.15}>
          <div className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-8 shadow-card">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-cherie-paper/60 text-cherie-burgundy">
              <MessageCircleHeart className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-2xl text-cherie-ink">
              Sorunuzu burada bulamadınız mı?
            </h3>
            <p className="mt-3 text-sm leading-6 text-cherie-soft-ink">
              Bir konsiyerjimiz, gününüzün tüm ayrıntılarını sizinle tek tek
              konuşmak için hazır. Yazmanız yeter.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={ROUTES.iletisim}
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-control bg-cherie-burgundy px-5 text-sm font-medium text-cherie-ivory transition-colors duration-control ease-cherie hover:bg-cherie-cherry"
              >
                Bize Yazın
                <ArrowRight className="h-4 w-4 transition-transform duration-control ease-cherie group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                href={ROUTES.sss}
                className="text-center text-sm font-medium text-cherie-burgundy underline-offset-4 hover:underline"
              >
                Tüm Soruları Gör
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
