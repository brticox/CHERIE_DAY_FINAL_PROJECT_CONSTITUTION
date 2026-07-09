'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Faq } from '@/lib/data/types';

/** Accessible FAQ accordion (docs/44 §8 — keyboard reachable, aria-expanded). */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-cherie-lace border-y border-cherie-lace">
      {faqs.map((faq) => {
        const isOpen = open === faq.id;
        return (
          <div key={faq.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-medium text-cherie-ink">{faq.question}</span>
              <ChevronDown
                className={cn(
                  'size-5 shrink-0 text-cherie-brass transition-transform duration-control ease-cherie',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen && (
              <p className="pb-5 text-sm leading-relaxed text-cherie-soft-ink">{faq.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
