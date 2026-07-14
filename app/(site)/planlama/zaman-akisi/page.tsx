import type { Metadata } from 'next';
import Link from 'next/link';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Zaman Akışı — Planlama | CHERIE DAY',
  description:
    'Hangi iş hangi haftada? Kutlamanıza giden yolu aylara ve haftalara bölen sakin bir zaman akışı. Erken başlayın, son haftaları rahat geçirin.',
  path: `${ROUTES.planlama}/zaman-akisi`,
});

const TIMELINE = [
  {
    marker: '6+ ay',
    title: 'Temeli atın',
    body: 'Konsept, bütçe ve tarih. Mekânı bu aşamada ayırtmak sonraki her adımı rahatlatır.',
  },
  {
    marker: '4–6 ay',
    title: 'Ekibi kurun',
    body: 'Organizasyon, dekor, fotoğraf ve müzik için teklifleri alın; davetiye koleksiyonunu seçin.',
  },
  {
    marker: '2–3 ay',
    title: 'Davet çıksın',
    body: 'Davetiyeleri onaylayıp bastırın ve gönderin. Hediyelik ve masa detaylarını sipariş edin.',
  },
  {
    marker: '1 ay',
    title: 'Detayları toplayın',
    body: 'RSVP’leri toplayın, oturma planını çıkarın, gelin hazırlığı provalarını tamamlayın.',
  },
  {
    marker: '1 hafta',
    title: 'Son teyitler',
    body: 'Tüm tedarikçilerle günün akışını paylaşın, sayıları kesinleştirin, gün çantasını hazırlayın.',
  },
  {
    marker: 'O gün',
    title: 'Yaşayın',
    body: 'Sorumlulukları devredin, bir adım geri çekilin. Bu günü izlemek de sizin hakkınız.',
  },
];

export default function ZamanAkisiPage() {
  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Planlama', path: ROUTES.planlama },
          { name: 'Zaman Akışı', path: `${ROUTES.planlama}/zaman-akisi` },
        ]}
      />
      <PageHeader
        eyebrow="Planlama"
        title="Hangi iş, hangi haftada?"
        lead="Kutlamaya giden yolu aylara böldük. Bu akış bir başlangıç noktasıdır; tarihinize ve iş kapsamınıza göre birlikte uyarlarız."
      />

      <ol className="mt-14 max-w-2xl border-l border-cherie-lace">
        {TIMELINE.map((step) => (
          <li key={step.marker} className="relative pb-10 pl-8 last:pb-0">
            <span
              className="absolute -left-[7px] top-1.5 size-3.5 rounded-full border-2 border-cherie-brass bg-cherie-ivory"
              aria-hidden
            />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cherie-brass">
              {step.marker}
              {step.marker === 'O gün' ? '' : ' önce'}
            </span>
            <h2 className="text-h3 mt-1 text-cherie-ink">{step.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-cherie-soft-ink">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-16 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-8">
        <h2 className="text-h3 text-cherie-ink">Akışı gününüze göre kuralım</h2>
        <p className="mt-2 max-w-xl text-sm text-cherie-soft-ink">
          Tarihiniz yaklaştıysa endişelenmeyin; kısa sürede de zarif bir kutlama
          mümkün. Kalan zamanı paylaşın, size özel bir plan çıkaralım.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`${ROUTES.planlama}/hayalini-tasarla`}>Hayalini Tasarla</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`${ROUTES.planlama}/kontrol-listesi`}>Kontrol Listesi</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
