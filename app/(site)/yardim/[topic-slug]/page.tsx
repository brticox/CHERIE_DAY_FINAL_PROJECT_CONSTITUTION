import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import { getHelpTopicBySlug, getHelpTopics, HELP_EMAILS } from '@/lib/data/help';
import { buildMetadata, faqPageLd } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { JsonLd } from '@/components/layout/json-ld';

export function generateStaticParams() {
  return getHelpTopics().map((t) => ({ 'topic-slug': t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ 'topic-slug': string }>;
}): Promise<Metadata> {
  const { 'topic-slug': slug } = await params;
  const topic = getHelpTopicBySlug(slug);
  if (!topic) return { title: 'Yardım Konusu Bulunamadı' };
  return buildMetadata({
    title: `${topic.title} | Yardım — CHERIE DAY`,
    description: topic.summary,
    path: `${ROUTES.yardim}/${topic.slug}`,
  });
}

export default async function HelpTopicPage({
  params,
}: {
  params: Promise<{ 'topic-slug': string }>;
}) {
  const { 'topic-slug': slug } = await params;
  const topic = getHelpTopicBySlug(slug);
  if (!topic) notFound();

  const email = HELP_EMAILS[topic.mailbox];

  return (
    <div className="cherie-container py-14 md:py-20">
      <JsonLd
        data={faqPageLd(
          topic.faqs.map((f, i) => ({
            id: `${topic.slug}-${i}`,
            question: f.q,
            answer: f.a,
            category: topic.slug,
          })),
        )}
      />
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Yardım', path: ROUTES.yardim },
          { name: topic.title, path: `${ROUTES.yardim}/${topic.slug}` },
        ]}
      />
      <PageHeader eyebrow="Yardım" title={topic.title} lead={topic.intro} />

      {/* FAQs — native details for JS-free accessibility */}
      <div className="mt-12 max-w-2xl divide-y divide-cherie-lace border-y border-cherie-lace">
        {topic.faqs.map((faq, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-cherie-ink [&::-webkit-details-marker]:hidden">
              <span className="font-medium">{faq.q}</span>
              <span className="text-cherie-brass transition-transform duration-control ease-cherie group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-cherie-soft-ink">{faq.a}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      {topic.related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-h3 text-cherie-ink">İlgili sayfalar</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {topic.related.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cherie-lace bg-cherie-ivory px-4 py-2 text-sm text-cherie-soft-ink transition-colors duration-control ease-cherie hover:border-cherie-brass hover:text-cherie-burgundy"
                >
                  {link.label}
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Escalation */}
      <section className="mt-12 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-8">
        <h2 className="text-h3 text-cherie-ink">Hâlâ yanıt bulamadınız mı?</h2>
        <p className="mt-2 max-w-xl text-sm text-cherie-soft-ink">
          Bu konuda size doğrudan yardımcı olalım. Yazarken sipariş numaranızı
          eklerseniz süreç hızlanır.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`mailto:${email}`}
            className="inline-flex h-11 items-center rounded-control bg-cherie-burgundy px-6 text-sm font-semibold text-cherie-ivory transition-colors hover:bg-cherie-cherry focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherie-focus focus-visible:ring-offset-2"
          >
            {email}
          </a>
          <Link
            href={ROUTES.iletisim}
            className="inline-flex h-11 items-center rounded-control border border-cherie-burgundy/55 px-6 text-sm font-semibold text-cherie-burgundy transition-colors hover:bg-cherie-paper"
          >
            İletişim Formu
          </Link>
        </div>
      </section>
    </div>
  );
}
