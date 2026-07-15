import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  FileText,
  Headphones,
  Heart,
  LogOut,
  MapPin,
  MonitorSmartphone,
  Package,
  Settings2,
  Sparkles,
} from 'lucide-react';

import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { NextActionCard } from '@/components/portal/next-action-card';
import { JourneyStepper } from '@/components/portal/journey-stepper';
import { Button } from '@/components/ui/button';
import { formatTRY } from '@/lib/format';
import { ROUTES } from '@/lib/data/routes';
import { getToday, type TodayCounts, type TodayModel } from '@/lib/portal/today';
import { logoutAction } from './actions';

export const metadata: Metadata = { title: 'Bugün', robots: { index: false, follow: false } };

const dateFmt = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'long',
  timeZone: 'Europe/Istanbul',
});
const dateTimeFmt = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Istanbul',
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [today, params] = await Promise.all([getToday(), searchParams]);
  if (!today) {
    // requireUser already redirects unauthenticated visitors; this is a defensive
    // fallback so the page never throws.
    return null;
  }

  return (
    <div className="cherie-container py-10 md:py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Bugün', path: ROUTES.hesap },
        ]}
      />

      {params.error === 'staff_required' && (
        <div
          role="alert"
          className="mb-8 rounded-card border border-cherie-warning/40 bg-cherie-warning/10 px-5 py-4 text-sm text-cherie-ink"
        >
          Yönetim alanına erişim yetkiniz yok. Müşteri hesabınıza güvenle devam edebilirsiniz.
        </div>
      )}

      <GreetingHeader today={today} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-6">
          {today.primaryAction ? (
            <NextActionCard action={today.primaryAction} />
          ) : (
            <FirstStepCard hasOccasion={Boolean(today.occasion)} />
          )}

          {today.spotlight && (
            <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6 shadow-sm md:p-7">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="cherie-kicker">Sipariş yolculuğu</p>
                  <h2 className="mt-2 font-display text-2xl">
                    <Link
                      href={`/hesap/siparisler/${today.spotlight.orderNumber}`}
                      className="rounded-sm text-cherie-ink underline-offset-4 hover:text-cherie-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {today.spotlight.orderNumber}
                    </Link>
                  </h2>
                </div>
                <p className="cherie-price font-display text-2xl text-cherie-burgundy">
                  {formatTRY(today.spotlight.totalAmount)}
                </p>
              </div>
              <JourneyStepper journey={today.spotlight.journey} className="mt-6" />
              <Link
                href={`/hesap/siparisler/${today.spotlight.orderNumber}`}
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cherie-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Sipariş kokpitini açın
                <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
              </Link>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {today.recentUpdate && today.recentUpdate.orderNumber && (
            <section className="rounded-card-lg border border-cherie-lace bg-cherie-paper/50 p-6">
              <p className="cherie-kicker">Son güncelleme</p>
              <p className="mt-3 font-semibold text-cherie-ink">{today.recentUpdate.title}</p>
              {today.recentUpdate.detail && (
                <p className="mt-1 text-sm text-cherie-soft-ink">{today.recentUpdate.detail}</p>
              )}
              <p className="mt-3 text-xs text-cherie-soft-ink">
                {dateTimeFmt.format(new Date(today.recentUpdate.at))} ·{' '}
                <Link
                  href={`/hesap/siparisler/${today.recentUpdate.orderNumber}`}
                  className="font-semibold text-cherie-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {today.recentUpdate.orderNumber}
                </Link>
              </p>
            </section>
          )}

          <ConciergeCard unread={today.counts.unreadNotifications} />
        </aside>
      </div>

      <ContextualAccess counts={today.counts} occasionDate={today.occasion?.eventDate ?? null} />
      <AccountEssentials unread={today.counts.unreadNotifications} />
    </div>
  );
}

function GreetingHeader({ today }: { today: TodayModel }) {
  const occasion = today.occasion;
  return (
    <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory px-6 py-8 shadow-sm md:px-10 md:py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="cherie-kicker flex items-center gap-2">
            <Sparkles className="size-3.5 text-cherie-brass" aria-hidden /> Maison salonunuz
          </p>
          <h1 className="mt-3 font-display text-3xl text-cherie-ink md:text-4xl">
            {today.timeGreeting}, {today.displayName}.
          </h1>
          {occasion ? (
            <p className="mt-3 max-w-xl text-sm leading-7 text-cherie-soft-ink">
              {occasionSentence(occasion.daysUntil, occasion.city)}{' '}
              <Link
                href={`/hesap/rezervasyonlar/${occasion.reservationNumber}`}
                className="font-semibold text-cherie-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Etkinlik ayrıntılarını görün
              </Link>
              .
            </p>
          ) : (
            <p className="mt-3 max-w-xl text-sm leading-7 text-cherie-soft-ink">
              Siparişlerinizi, provalarınızı ve etkinlik hazırlığınızı burada bir arada tutuyoruz.
            </p>
          )}
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            <LogOut className="size-4" aria-hidden /> Çıkış Yap
          </Button>
        </form>
      </div>
    </section>
  );
}

function occasionSentence(daysUntil: number | null, city: string | null): string {
  const place = city ? `${city}'daki etkinliğinize` : 'Etkinliğinize';
  if (daysUntil === null) return `${place} hazırlanıyoruz.`;
  if (daysUntil === 0) return `${place} bugün ulaşıyoruz.`;
  if (daysUntil === 1) return `${place} yalnızca 1 gün kaldı.`;
  return `${place} ${daysUntil} gün kaldı.`;
}

function FirstStepCard({ hasOccasion }: { hasOccasion: boolean }) {
  return (
    <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6 shadow-card md:p-8">
      <p className="cherie-kicker flex items-center gap-2">
        <Sparkles className="size-3.5 text-cherie-brass" aria-hidden /> İlk adım
      </p>
      <h2 className="mt-3 font-display text-2xl text-cherie-ink md:text-3xl">
        Hikâyenizin ilk parçasını birlikte seçelim
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-7 text-cherie-soft-ink">
        {hasOccasion
          ? 'Etkinliğiniz için hazırlığa başladık. Davetiye ve tamamlayıcı parçalarınızı mağazamızdan seçtiğinizde bu alan sipariş yolculuğunuzla dolacak.'
          : 'Henüz bir siparişiniz yok. Mağazamızdaki koleksiyonlardan başlayabilir ya da özel bir üretim için teklif isteyebilirsiniz.'}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/magaza"
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-cherie-burgundy px-5 text-sm font-semibold text-cherie-ivory transition-transform duration-control ease-cherie hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          Mağazayı keşfedin
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href="/teklif"
          className="inline-flex min-h-11 items-center gap-2 rounded-control border border-cherie-burgundy px-5 text-sm font-semibold text-cherie-burgundy transition-transform duration-control ease-cherie hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          Teklif isteyin
        </Link>
      </div>
    </section>
  );
}

function ConciergeCard({ unread }: { unread: number }) {
  return (
    <section className="rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6 shadow-sm">
      <p className="cherie-kicker flex items-center gap-2">
        <Headphones className="size-3.5 text-cherie-brass" aria-hidden /> Yanınızdayız
      </p>
      <p className="mt-3 text-sm leading-7 text-cherie-soft-ink">
        Bir sorunuz ya da özel bir isteğiniz mi var? Maison ekibimiz size güvenle eşlik eder.
      </p>
      <Link
        href="/hesap/destek"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cherie-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        Bize yazın
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
      </Link>
      {unread > 0 && (
        <p className="mt-3 text-xs text-cherie-soft-ink">
          {unread} okunmamış bildiriminiz var.
        </p>
      )}
    </section>
  );
}

type AccessItem = {
  title: string;
  description: string;
  href: string;
  icon: typeof Package;
  count: number;
  show: boolean;
};

function ContextualAccess({
  counts,
  occasionDate,
}: {
  counts: TodayCounts;
  occasionDate: string | null;
}) {
  const items: AccessItem[] = [
    {
      title: 'Siparişlerim',
      description: `${counts.orders} sipariş · ${counts.activeOrders} sürüyor`,
      href: '/hesap/siparisler',
      icon: Package,
      count: counts.orders,
      show: counts.orders > 0,
    },
    {
      title: 'Provalarım',
      description: 'Tasarım onaylarınızı inceleyin',
      href: '/hesap/tasarim-onaylari',
      icon: BookOpenCheck,
      count: counts.activeOrders,
      show: counts.activeOrders > 0,
    },
    {
      title: 'Rezervasyonlarım',
      description: occasionDate
        ? `Etkinlik: ${dateFmt.format(new Date(occasionDate))}`
        : `${counts.reservations} rezervasyon`,
      href: '/hesap/rezervasyonlar',
      icon: CalendarDays,
      count: counts.reservations,
      show: counts.reservations > 0,
    },
    {
      title: 'Tekliflerim',
      description: `${counts.quotes} teklif`,
      href: '/hesap/tekliflerim',
      icon: FileText,
      count: counts.quotes,
      show: counts.quotes > 0,
    },
    {
      title: 'Dijital projelerim',
      description: `${counts.digitalProjects} proje`,
      href: '/hesap/dijital',
      icon: MonitorSmartphone,
      count: counts.digitalProjects,
      show: counts.digitalProjects > 0,
    },
    {
      title: 'Favorilerim',
      description: `${counts.favorites} kayıtlı parça`,
      href: '/hesap/favoriler',
      icon: Heart,
      count: counts.favorites,
      show: counts.favorites > 0,
    },
  ];
  const visible = items.filter((item) => item.show);
  if (visible.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="contextual-access-heading">
      <h2 id="contextual-access-heading" className="font-display text-2xl text-cherie-ink">
        Size ait alanlar
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ title, description, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-card-lg border border-cherie-lace bg-cherie-ivory p-6 shadow-sm transition-transform duration-card ease-cherie hover:-translate-y-1 hover:border-cherie-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span className="grid size-11 place-items-center rounded-full bg-cherie-paper text-cherie-burgundy">
              <Icon className="size-5" strokeWidth={1.6} aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-xl text-cherie-ink group-hover:text-cherie-burgundy">
              {title}
            </h3>
            <p className="mt-1 text-sm text-cherie-soft-ink">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function AccountEssentials({ unread }: { unread: number }) {
  const links = [
    { title: 'Adreslerim', href: '/hesap/adresler', icon: MapPin },
    { title: 'Bildirimler', href: '/hesap/bildirimler', icon: Bell, badge: unread },
    { title: 'Destek', href: '/hesap/destek', icon: Headphones },
    { title: 'Hesap ve tercihler', href: '/hesap/tercihler', icon: Settings2 },
  ] as const;
  return (
    <section className="mt-8" aria-labelledby="account-essentials-heading">
      <h2 id="account-essentials-heading" className="sr-only">
        Hesap alanları
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map(({ title, href, icon: Icon, ...rest }) => {
          const badge = 'badge' in rest ? rest.badge : 0;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-card border border-cherie-lace bg-cherie-paper/40 px-4 py-3 text-sm font-semibold text-cherie-ink transition-colors hover:border-cherie-brass hover:bg-cherie-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Icon className="size-4 text-cherie-burgundy" strokeWidth={1.7} aria-hidden />
              {title}
              {badge && badge > 0 ? (
                <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-cherie-burgundy px-1.5 text-xs font-semibold text-cherie-ivory">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
