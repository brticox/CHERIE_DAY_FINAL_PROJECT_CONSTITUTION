import type { Metadata } from 'next';

import { buildMetadata, organizationLd } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { JsonLd } from '@/components/layout/json-ld';

export const metadata: Metadata = buildMetadata({
  title: 'İletişim | CHERIE DAY',
  description: 'CHERIE DAY ile iletişime geçin; sorularınız için WhatsApp ve e-posta.',
  path: ROUTES.iletisim,
});

export default function IletisimPage() {
  const whatsapp = process.env.WHATSAPP_CONTACT_URL;
  return (
    <div className="cherie-container max-w-3xl py-14">
      <JsonLd data={organizationLd()} />
      <Breadcrumbs items={[{ name: 'Ana Sayfa', path: ROUTES.home }, { name: 'İletişim', path: ROUTES.iletisim }]} />
      <PageHeader
        eyebrow="CHERIE DAY"
        title="Bize yazın; bahçenin kapısı açık"
        lead="Bir sorunuz mu var, yoksa bir hayaliniz mi? İkisi için de buradayız."
      />

      <dl className="mt-10 space-y-6 border-t border-cherie-lace pt-8 text-sm">
        <div>
          <dt className="text-cherie-brass">WhatsApp</dt>
          <dd className="mt-1">
            {whatsapp ? (
              <a href={whatsapp} className="text-cherie-burgundy hover:underline">WhatsApp ile Yaz</a>
            ) : (
              <span className="text-cherie-soft-ink">WhatsApp hattı yakında paylaşılacak.</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-cherie-brass">E-posta</dt>
          <dd className="mt-1 text-cherie-soft-ink">merhaba@cherieday.example</dd>
        </div>
        <div>
          <dt className="text-cherie-brass">Hizmet Bölgesi</dt>
          <dd className="mt-1 text-cherie-soft-ink">Türkiye geneli · İstanbul, Ankara, İzmir, Bursa, Antalya</dd>
        </div>
      </dl>

      <p className="mt-8 rounded-card border border-dashed border-cherie-lace bg-cherie-paper/50 px-4 py-3 text-sm text-cherie-soft-ink">
        İletişim formu bir sonraki aşamada etkinleşecek. O zamana kadar WhatsApp veya e-posta ile
        bize ulaşabilirsiniz.
      </p>
    </div>
  );
}
