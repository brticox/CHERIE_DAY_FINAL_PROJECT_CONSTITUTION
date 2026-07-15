import type { Metadata } from 'next';
import Link from 'next/link';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import {
  PlanningChecklist,
  type ChecklistGroup,
} from '@/components/content/planning-checklist';

export const metadata: Metadata = buildMetadata({
  title: 'Kontrol Listesi — Planlama | CHERIE DAY',
  description:
    'Kutlamanızı adım adım, telaşsız ilerletin. Zamana göre sıralanmış kontrol listesiyle hiçbir detay unutulmasın. İşaretledikleriniz tarayıcınızda saklanır.',
  path: `${ROUTES.planlama}/kontrol-listesi`,
});

const GROUPS: ChecklistGroup[] = [
  {
    phase: 'İlk adımlar',
    when: '6+ ay önce',
    items: [
      { id: 'concept', label: 'Konsept ve genel tonu belirleyin' },
      { id: 'budget', label: 'Yaklaşık bütçeyi ve öncelikleri netleştirin' },
      { id: 'date', label: 'Tarih ve sezon için birkaç seçenek belirleyin' },
      { id: 'guests', label: 'Tahmini misafir sayısını çıkarın' },
      { id: 'venue', label: 'Mekân araştırmasına başlayın' },
    ],
  },
  {
    phase: 'Şekilleniyor',
    when: '3–6 ay önce',
    items: [
      { id: 'services', label: 'Organizasyon ve dekor için teklif alın' },
      { id: 'photo', label: 'Fotoğraf ve film ekibini ayırtın' },
      { id: 'invite-design', label: 'Davetiye tasarımını ve koleksiyonu seçin' },
      { id: 'guestlist', label: 'Misafir listesini kesinleştirin' },
      { id: 'music', label: 'Müzik / DJ seçimini yapın' },
    ],
  },
  {
    phase: 'Detaylar',
    when: '1–3 ay önce',
    items: [
      { id: 'invite-order', label: 'Davetiyeleri onaylayıp bastırın' },
      { id: 'send', label: 'Davetiyeleri gönderin, dijital davetiyeyi paylaşın' },
      { id: 'favors', label: 'Hediyelik ve nikah şekerini sipariş edin' },
      { id: 'stationery', label: 'Masa kartı, menü ve karşılama panosunu hazırlayın' },
      { id: 'attire', label: 'Gelin hazırlığı ve kıyafet provalarını tamamlayın' },
    ],
  },
  {
    phase: 'Son düzlük',
    when: 'Son 4 hafta',
    items: [
      { id: 'rsvp', label: 'RSVP’leri toplayın, sayıyı güncelleyin' },
      { id: 'seating', label: 'Oturma planını çıkarın' },
      { id: 'timeline', label: 'Günün akışını ekiple paylaşın' },
      { id: 'confirm', label: 'Tüm tedarikçilerle son teyidi yapın' },
      { id: 'kit', label: 'Gün çantasını (yedekler, iğne, mendil) hazırlayın' },
    ],
  },
  {
    phase: 'Kutlama günü',
    when: 'O gün',
    items: [
      { id: 'delegate', label: 'Sorumlulukları yakınlarınıza devredin' },
      { id: 'breathe', label: 'Bir adım geri çekilip günü yaşayın' },
    ],
  },
];

export default function KontrolListesiPage() {
  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Planlama', path: ROUTES.planlama },
          { name: 'Kontrol Listesi', path: `${ROUTES.planlama}/kontrol-listesi` },
        ]}
      />
      <PageHeader
        eyebrow="Planlama"
        title="Adımları sırayla, huzurla ilerleyin"
        lead="Zamana göre dizilmiş bu listeyle her şeyi aklınızda tutma yükünü bırakın. İşaretledikleriniz yalnızca bu tarayıcıda saklanır."
      />

      <div className="mt-12 max-w-2xl">
        <PlanningChecklist groups={GROUPS} />
      </div>

      <p className="mt-10 max-w-2xl text-sm text-cherie-soft-ink">
        Hangi işin hangi haftaya düştüğünü görmek için{' '}
        <Link href={`${ROUTES.planlama}/zaman-akisi`} className="text-cherie-burgundy hover:underline">
          Zaman Akışı
        </Link>{' '}
        sayfasına, bütçeyi paylaştırmak için{' '}
        <Link href={`${ROUTES.planlama}/butce-rehberi`} className="text-cherie-burgundy hover:underline">
          Bütçe Rehberi
        </Link>
        ’ne göz atın.
      </p>
    </div>
  );
}
