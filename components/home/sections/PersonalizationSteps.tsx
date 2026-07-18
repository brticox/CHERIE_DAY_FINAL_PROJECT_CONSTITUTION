import Link from 'next/link';
import {
  Check,
  PencilLine,
  Eye,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/lib/data/routes';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

const STEPS: {
  icon: LucideIcon;
  title: string;
  description: string;
  anchor?: boolean;
}[] = [
  { icon: Check, title: 'Seç', description: 'Dünyanızı ve ürününüzü seçin.' },
  {
    icon: PencilLine,
    title: 'Kişiselleştir',
    description: 'İsim, tarih, renk, mühür — hikâyenize göre.',
  },
  { icon: Eye, title: 'Önizle', description: 'Tasarımı ekranda, gerçek hâliyle görün.' },
  {
    icon: ShieldCheck,
    title: 'Onayla',
    description: 'Onayınız gelmeden hiçbir şey üretime girmez.',
    anchor: true,
  },
  { icon: Sparkles, title: 'Üret', description: 'Atölyede, el işçiliğiyle hayat bulur.' },
  {
    icon: PackageCheck,
    title: 'Teslim',
    description: 'Özenle paketlenir, kapınıza gelir.',
  },
];

/**
 * PersonalizationSteps — the customization journey as a guided rail. The
 * "Onayla" node is the emotional anchor: nothing enters production before the
 * customer approves. Horizontal stepper on desktop, vertical timeline on mobile.
 */
export function PersonalizationSteps() {
  return (
    <SectionShell
      eyebrow="Kişiselleştirme"
      title="Sizin hikâyeniz, sizin onayınız."
      lede="Kişiye özel her üründe tek bir söz geçerlidir: siz onaylamadan üretim başlamaz."
      className="bg-cherie-paper/40"
    >
      <ol className="relative grid gap-x-4 gap-y-8 before:absolute before:left-[8%] before:right-[8%] before:top-7 before:hidden before:h-px before:bg-gradient-to-r before:from-cherie-lace before:via-cherie-brass/50 before:to-cherie-lace before:content-[''] sm:grid-cols-2 lg:grid-cols-6 lg:before:block">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="relative text-center">
              <Reveal delay={i * 0.08} className="flex flex-col items-center">
                <span
                  className={`relative z-10 grid h-14 w-14 place-items-center rounded-full border shadow-card transition-transform duration-card ease-cherie ${
                    step.anchor
                      ? 'border-cherie-burgundy bg-cherie-burgundy text-cherie-ivory'
                      : 'border-cherie-lace bg-cherie-ivory text-cherie-brass'
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
                </span>
                <span className="mt-4 flex items-center gap-2 font-display text-xl text-cherie-ink">
                  <span className="text-sm text-cherie-brass">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {step.title}
                </span>
                <p className="mt-1.5 max-w-[15rem] text-sm leading-6 text-cherie-soft-ink">
                  {step.description}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ol>

      {/* the promise, restated as a quiet guarantee line */}
      <Reveal className="mt-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-card-lg border border-cherie-lace bg-cherie-ivory px-8 py-7 text-center shadow-card sm:flex-row sm:text-left">
          <ShieldCheck
            className="h-8 w-8 shrink-0 text-cherie-burgundy"
            strokeWidth={1.4}
            aria-hidden
          />
          <p className="flex-1 text-base leading-7 text-cherie-soft-ink">
            <span className="font-medium text-cherie-ink">Onay güvencesi:</span> Dijital
            provanızı görmeden, beğenmeden ve onaylamadan üretim başlamaz.
          </p>
          <Link
            href={ROUTES.maisonNasilCalisir}
            className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-cherie-burgundy underline-offset-4 hover:underline"
          >
            Süreci inceleyin
          </Link>
        </div>
      </Reveal>
    </SectionShell>
  );
}
