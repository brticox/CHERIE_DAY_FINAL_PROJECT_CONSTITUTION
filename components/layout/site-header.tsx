'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageCircle, Search, User, ShoppingBag } from 'lucide-react';

import { PRIMARY_NAV, PRIMARY_CTA } from '@/lib/data/navigation';
import { ROUTES } from '@/lib/data/routes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrandLogo } from './brand-logo';
import { MobileNav } from './mobile-nav';

/**
 * Public site header (docs/40 §4.1, docs/47 §4). Over the homepage sky it is
 * a transparent veil with ivory type; the moment the descent begins it turns
 * to frosted ivory paper with a thin brass underline. Arama, Hesabım,
 * Seçimlerim and WhatsApp stay live at every scroll depth — frame one onward.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [atTop, setAtTop] = useState(true);
  const overSky = pathname === '/' && atTop;

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL;

  return (
    <>
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300 ease-cherie',
        overSky
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-cherie-brass/35 bg-cherie-ivory/88 shadow-[0_1px_0_rgba(176,138,87,0.18)] backdrop-blur-[14px]',
      )}
      data-chrome={overSky ? 'sky' : 'paper'}
    >
      <div
        className={cn(
          'cherie-container flex h-16 items-center justify-between gap-4 transition-colors duration-300',
          overSky ? 'text-cherie-ivory' : 'text-cherie-ink',
        )}
      >
        <div className="flex items-center gap-3">
          <MobileNav />
          <span className={cn(overSky && 'brightness-0 invert')}>
            <BrandLogo />
          </span>
        </div>

        <nav aria-label="Ana menü" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'text-sm transition-colors duration-control ease-cherie',
                    overSky
                      ? 'text-cherie-ivory/85 hover:text-cherie-ivory'
                      : 'text-cherie-soft-ink hover:text-cherie-burgundy',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={cn('flex items-center gap-1', overSky && '[&_svg]:stroke-[1.5]')}>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Arama"
            className={cn(overSky && 'text-cherie-ivory hover:bg-cherie-ivory/15 hover:text-cherie-ivory')}
          >
            <Link href={ROUTES.arama}>
              <Search strokeWidth={1.5} />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Hesabım"
            className={cn(overSky && 'text-cherie-ivory hover:bg-cherie-ivory/15 hover:text-cherie-ivory')}
          >
            <Link href={ROUTES.hesap}>
              <User strokeWidth={1.5} />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Seçimlerim"
            className={cn(overSky && 'text-cherie-ivory hover:bg-cherie-ivory/15 hover:text-cherie-ivory')}
          >
            <Link href={ROUTES.secilimlerim}>
              <ShoppingBag strokeWidth={1.5} />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="WhatsApp ile Yaz"
            className={cn(overSky && 'text-cherie-ivory hover:bg-cherie-ivory/15 hover:text-cherie-ivory')}
          >
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle strokeWidth={1.5} />
              </a>
            ) : (
              <Link href={ROUTES.iletisim}>
                <MessageCircle strokeWidth={1.5} />
              </Link>
            )}
          </Button>
          <Button
            asChild
            size="sm"
            className={cn(
              'ml-2 hidden sm:inline-flex',
              overSky && 'bg-cherie-ivory/15 text-cherie-ivory backdrop-blur-[4px] hover:bg-cherie-ivory/25',
            )}
          >
            <Link href={PRIMARY_CTA.href}>{PRIMARY_CTA.label}</Link>
          </Button>
        </div>
      </div>
    </header>
    {/* Flow spacer: the homepage hero runs beneath the transparent veil;
        every other surface starts below the paper header. */}
    {pathname !== '/' ? <div aria-hidden="true" className="h-16" /> : null}
    </>
  );
}
