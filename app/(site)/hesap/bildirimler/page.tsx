import type { Metadata } from 'next';
import Link from 'next/link';
import { Bell, Check } from 'lucide-react';

import { requireUser } from '@/lib/auth/guards';
import { getNotificationFeed } from '@/lib/account/notifications';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/data/routes';
import { markAllReadAction, markReadAction } from './actions';

export const metadata: Metadata = {
  title: 'Bildirimlerim',
  robots: { index: false, follow: false },
};

const dateFmt = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Istanbul',
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireUser('/hesap/bildirimler');
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const feed = await getNotificationFeed(page);

  return (
    <div className="cherie-container py-14">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Hesabım', path: ROUTES.hesap },
          { name: 'Bildirimlerim', path: '/hesap/bildirimler' },
        ]}
      />
      <PageHeader
        eyebrow="Hesabım"
        title="Bildirimlerim"
        lead="Siparişleriniz, provalarınız ve etkinlik hazırlığınıza dair güncellemeler burada."
      />

      {feed.items.length > 0 && feed.unreadCount > 0 && (
        <form action={markAllReadAction} className="mt-6 flex justify-end">
          <Button type="submit" variant="secondary" size="sm">
            <Check /> Tümünü okundu işaretle
          </Button>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {feed.items.length === 0 ? (
          <div className="rounded-card-lg border border-cherie-lace bg-cherie-paper/50 px-6 py-16 text-center">
            <Bell className="mx-auto size-6 text-cherie-brass" strokeWidth={1.6} />
            <h2 className="mt-3 font-display text-2xl text-cherie-ink">
              Yeni bir bildiriminiz yok
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-cherie-soft-ink">
              Siparişiniz ilerledikçe ve size özel haberler oldukça bu alan güncellenecek.
            </p>
          </div>
        ) : (
          feed.items.map((item) => (
            <article
              key={item.id}
              className={`flex items-start gap-4 rounded-card-lg border p-5 ${
                item.isRead
                  ? 'border-cherie-lace bg-cherie-ivory'
                  : 'border-cherie-brass/40 bg-cherie-paper/60'
              }`}
            >
              <span
                aria-hidden
                className={`mt-1.5 size-2 shrink-0 rounded-full ${
                  item.isRead ? 'bg-transparent' : 'bg-cherie-burgundy'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-cherie-ink">
                  {item.link ? (
                    <Link href={item.link} className="hover:text-cherie-burgundy hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </p>
                {item.body && (
                  <p className="mt-1 text-sm leading-6 text-cherie-soft-ink">{item.body}</p>
                )}
                <p className="mt-2 text-xs text-cherie-soft-ink">
                  {dateFmt.format(new Date(item.createdAt))}
                  {!item.isRead && (
                    <span className="ml-2 text-cherie-burgundy">· Okunmadı</span>
                  )}
                </p>
              </div>
              {!item.isRead && (
                <form action={markReadAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-control px-2 text-sm font-medium text-cherie-burgundy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <Check className="size-4" /> Okundu
                  </button>
                </form>
              )}
            </article>
          ))
        )}
      </div>

      {(feed.page > 1 || feed.hasMore) && (
        <div className="mt-8 flex items-center justify-between">
          {feed.page > 1 ? (
            <Link
              href={`/hesap/bildirimler?page=${feed.page - 1}`}
              className="text-sm font-medium text-cherie-burgundy hover:underline"
            >
              ← Önceki
            </Link>
          ) : (
            <span />
          )}
          {feed.hasMore && (
            <Link
              href={`/hesap/bildirimler?page=${feed.page + 1}`}
              className="text-sm font-medium text-cherie-burgundy hover:underline"
            >
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
