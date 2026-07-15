import Link from 'next/link';

import { FOOTER_GROUPS } from '@/lib/data/navigation';
import { ROUTES } from '@/lib/data/routes';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button } from '@/components/ui/button';

/** Public site footer (docs/40 §4.4) with Yasal + Yardım + Hizmetler columns.
 *  Çerez Tercihleri must be reachable from every page (docs/44 §7). */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-cherie-velvet text-cherie-ivory">
      <div className="cherie-container py-12 md:py-16">
        <div className="border-cherie-ivory/12 flex flex-col gap-7 border-b pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="cherie-kicker">Birlikte tasarlayalım</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-cherie-ivory md:text-5xl">
              Kutlamanız, size benzeyen bir hikâyeye dönüşsün.
            </h2>
          </div>
          <Button
            asChild
            size="lg"
            className="w-fit bg-cherie-ivory text-cherie-burgundy hover:bg-cherie-paper"
          >
            <Link href={ROUTES.teklif}>
              Özel Teklif Al <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
      <div className="cherie-container grid grid-cols-2 gap-8 pb-14 md:grid-cols-5">
        <div className="col-span-2 md:col-span-1">
          <div className="w-fit brightness-0 invert">
            <BrandLogo />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-6 text-cherie-lace">
            Türkiye’ye özel lüks düğün, hediye ve kutlama maison’u.
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              href={ROUTES.iletisim}
              aria-label="İletişim"
              className="grid size-11 place-items-center rounded-full border border-cherie-ivory/20 text-cherie-lace transition hover:border-cherie-brass hover:text-cherie-brass"
            >
              <MessageCircle className="size-4" />
            </Link>
          </div>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="mb-4 text-sm font-semibold text-cherie-ivory">{group.title}</p>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 min-w-11 items-center text-sm text-cherie-lace/80 transition-colors duration-control ease-cherie hover:text-cherie-brass"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-cherie-ivory/12 border-t">
        <div className="cherie-container flex flex-col gap-3 py-6 text-xs text-cherie-lace/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} CHERIE DAY. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={`${ROUTES.kurumsal}/cerez-tercihleri`}
              className="inline-flex min-h-11 min-w-11 items-center hover:text-cherie-brass"
            >
              Çerez Tercihleri
            </Link>
            <Link
              href={`${ROUTES.kurumsal}/kvkk-aydinlatma`}
              className="inline-flex min-h-11 min-w-11 items-center hover:text-cherie-brass"
            >
              KVKK Aydınlatma Metni
            </Link>
            <Link
              href={`${ROUTES.kurumsal}/satici-bilgileri`}
              className="inline-flex min-h-11 min-w-11 items-center hover:text-cherie-brass"
            >
              Satıcı Bilgileri
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
