import Link from 'next/link';

import type { Faq } from '@/lib/data/types';
import { ROUTES } from '@/lib/data/routes';
import { FaqAccordion } from '@/components/content/faq-accordion';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * FaqPreview — the friction remover before the footer: four questions,
 * answered calmly, reusing the existing accessible accordion.
 */
export function FaqPreview({ faqs }: { faqs: Faq[] }) {
  return (
    <SectionShell
      eyebrow="Sorular"
      title="Aklınızdaki sorular"
      lede="Teslimattan tasarım onayına — en çok sorulanların kısa yanıtları."
      className="bg-cherie-paper/40"
    >
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <Reveal>
          <FaqAccordion faqs={faqs} />
        </Reveal>
        <Reveal delay={0.15}>
          <div className="rounded-card border border-cherie-lace bg-cherie-ivory p-8 shadow-card">
            <h3 className="font-display text-xl text-cherie-ink">
              Sorunuz burada yok mu?
            </h3>
            <p className="mt-3 text-sm leading-6 text-cherie-soft-ink">
              Tüm soruların yanıtları yardım merkezinde; dilerseniz doğrudan da
              yazabilirsiniz.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={ROUTES.sss}
                className="text-sm font-medium text-cherie-burgundy underline-offset-4 hover:underline"
              >
                Tüm Soruları Gör
              </Link>
              <Link
                href={ROUTES.iletisim}
                className="text-sm font-medium text-cherie-burgundy underline-offset-4 hover:underline"
              >
                Bize Yazın
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
