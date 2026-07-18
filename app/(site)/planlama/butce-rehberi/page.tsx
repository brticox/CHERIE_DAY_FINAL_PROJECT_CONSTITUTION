import type { Metadata } from 'next';
import Link from 'next/link';

import { buildMetadata } from '@/lib/data/seo';
import { ROUTES } from '@/lib/data/routes';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = buildMetadata({
  title: 'Bütçe Rehberi — Planlama | CHERIE DAY',
  description:
    'Kutlamanızın bütçesini önceliklere göre paylaştırmanın sakin bir yolu. Örnek dağılım oranları ve tasarruf yapmadan zarafeti korumanın ipuçları.',
  path: `${ROUTES.planlama}/butce-rehberi`,
});

const ALLOCATION = [
  { area: 'Mekân & ikram', share: '40–50%', note: 'Genelde en büyük kalem; misafir sayısıyla doğrudan bağlı.' },
  { area: 'Organizasyon & dekor', share: '12–18%', note: 'Konsept, sahne, masa ve karşılama alanı.' },
  { area: 'Fotoğraf & film', share: '10–15%', note: 'Günden geriye kalan; kısılması en çok pişman edilen kalem.' },
  { area: 'Gelin hazırlığı', share: '8–12%', note: 'Kıyafet, saç, makyaj ve o sabahın detayları.' },
  { area: 'Davetiye & basılı', share: '3–6%', note: 'Davetiye, masa kartı, menü — günün ilk izlenimi.' },
  { area: 'Müzik & eğlence', share: '6–10%', note: 'DJ, canlı müzik ya da ikisinin dengesi.' },
  { area: 'Hediyelik & hatıra', share: '3–5%', note: 'Misafire kalan küçük, anlamlı jestler.' },
  { area: 'Beklenmedik pay', share: '5–10%', note: 'Her planda olması gereken güvenli boşluk.' },
];

const TIPS = [
  {
    title: 'Önce üç kalemi seçin',
    body: 'Sizin için en değerli üç şeye (örneğin mekân, fotoğraf, davetiye) bütçenin ağırlığını verin; gerisini buna göre ölçün.',
  },
  {
    title: 'Misafir sayısı çarpandır',
    body: 'Her ek misafir yalnızca ikram değil; masa, kart, hediyelik demektir. Listeyi erken netleştirmek bütçeyi rahatlatır.',
  },
  {
    title: 'Sezon ve gün seçimi',
    body: 'Sezon dışı tarihler ve hafta içi günler, aynı zarafeti daha ölçülü bir bütçeyle mümkün kılabilir.',
  },
  {
    title: 'Set almak tek tek almaktan ferahtır',
    body: 'Davetiye, mühür ve kurdeleyi ayrı ayrı yerine uyumlu bir set olarak seçmek hem görsel bütünlük hem denge sağlar.',
  },
];

export default function ButceRehberiPage() {
  return (
    <div className="cherie-container py-14 md:py-20">
      <Breadcrumbs
        items={[
          { name: 'Ana Sayfa', path: ROUTES.home },
          { name: 'Planlama', path: ROUTES.planlama },
          { name: 'Bütçe Rehberi', path: `${ROUTES.planlama}/butce-rehberi` },
        ]}
      />
      <PageHeader
        eyebrow="Planlama"
        title="Bütçeyi önceliklere göre paylaştırmanın sakin yolu"
        lead="Aşağıdaki oranlar bir başlangıç noktasıdır — kesin bir kural değil. Amacımız, paranızı sizin için en değerli detaylara doğru yönlendirmenize yardımcı olmak."
      />

      {/* Allocation table */}
      <section className="mt-14">
        <h2 className="text-h3 text-cherie-ink">Örnek dağılım</h2>
        <div className="mt-6 overflow-hidden rounded-card-lg border border-cherie-lace">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-cherie-paper/60 text-cherie-ink">
                <th scope="col" className="px-4 py-3 font-semibold">Kalem</th>
                <th scope="col" className="px-4 py-3 font-semibold">Önerilen pay</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Not</th>
              </tr>
            </thead>
            <tbody>
              {ALLOCATION.map((row, i) => (
                <tr
                  key={row.area}
                  className={i % 2 === 1 ? 'bg-cherie-ivory' : 'bg-cherie-ivory/50'}
                >
                  <td className="px-4 py-3 font-medium text-cherie-ink">{row.area}</td>
                  <td className="px-4 py-3 tabular-nums text-cherie-burgundy">{row.share}</td>
                  <td className="hidden px-4 py-3 text-cherie-soft-ink sm:table-cell">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-cherie-soft-ink">
          Oranlar toplamı, güvenli pay dahil %100’ü aşabilir; ihtiyacınıza göre
          içeride dengeleyin. Bunlar taahhüt değil, yön gösteren örneklerdir.
        </p>
      </section>

      {/* Tips */}
      <section className="mt-16">
        <h2 className="text-h3 text-cherie-ink">Zarafeti koruyarak dengelemek</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {TIPS.map((tip) => (
            <div key={tip.title} className="rounded-card border border-cherie-lace bg-cherie-ivory p-6">
              <h3 className="font-display text-lg text-cherie-ink">{tip.title}</h3>
              <p className="mt-2 text-sm leading-6 text-cherie-soft-ink">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next */}
      <section className="mt-16 rounded-card-lg border border-cherie-lace bg-cherie-paper/40 p-8">
        <h2 className="text-h3 text-cherie-ink">Rakamları birlikte netleştirelim</h2>
        <p className="mt-2 max-w-xl text-sm text-cherie-soft-ink">
          Konseptinizi ve misafir sayınızı paylaşın; size özel, gerçekçi bir
          teklif hazırlayalım. Kesin fiyat her zaman iş kapsamına göre belirlenir.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={ROUTES.teklif}>Teklif Al</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`${ROUTES.planlama}/kontrol-listesi`}>Kontrol Listesine Geç</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
