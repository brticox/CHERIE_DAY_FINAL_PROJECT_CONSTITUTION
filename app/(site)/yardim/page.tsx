import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, PackageSearch } from 'lucide-react';

import { getHelpTopics, HELP_EMAILS } from '@/lib/data/help';
import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';

export const metadata: Metadata = buildMetadata({
  title: 'Yardım Merkezi | CHERIE DAY',
  description:
    'Sipariş takibi, teslimat, tasarım onayı, iade, ödeme ve dijital teslimat hakkında sık sorulan konular. Aradığınızı bulamazsanız bize yazın.',
  path: ROUTES.yardim,
});

export default function YardimPage() {
  const topics = getHelpTopics();

  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Yardım', path: ROUTES.yardim },
        ]}
      />
      <PageHeader
        eyebrow="Yardım"
        title="Bahçenin kapısı her zaman açık"
        lead="Aradığınız konuyu seçin; her başlıkta en çok merak edilenleri yanıtladık. Bulamazsanız bize danışmaktan çekinmeyin."
      />

      {/* Quick order-help callout */}
      <Link
        href={ROUTES.yardim + '/siparisim'}
        className="group mt-12 flex items-center gap-4 rounded-card-lg border border-cherie-lace bg-cherie-paper/50 p-6 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-cherie-lace bg-cherie-ivory text-cherie-brass">
          <PackageSearch className="size-5" strokeWidth={1.6} />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-xl text-cherie-ink group-hover:text-cherie-burgundy">
            Siparişim hakkında yardım
          </h2>
          <p className="mt-0.5 text-sm text-cherie-soft-ink">
            Sipariş durumu, teslimat ve değişiklik talepleri için hızlı yol.
          </p>
        </div>
        <ArrowUpRight className="size-5 text-cherie-brass transition-transform duration-control ease-cherie group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>

      {/* Topic grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`${ROUTES.yardim}/${topic.slug}`}
            className="group rounded-card border border-cherie-lace bg-cherie-ivory p-6 transition-colors duration-card ease-cherie hover:border-cherie-burgundy"
          >
            <h3 className="text-h3 text-cherie-ink group-hover:text-cherie-burgundy">
              {topic.title}
            </h3>
            <p className="mt-1.5 text-sm text-cherie-soft-ink">{topic.summary}</p>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-cherie-soft-ink">
        Aradığınızı bulamadınız mı?{' '}
        <Link href={ROUTES.iletisim} className="text-cherie-burgundy hover:underline">
          İletişime geçin
        </Link>{' '}
        ya da{' '}
        <a
          href={`mailto:${HELP_EMAILS.support}`}
          className="text-cherie-burgundy hover:underline"
        >
          {HELP_EMAILS.support}
        </a>{' '}
        adresine yazın.
      </p>
    </div>
  );
}
