import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * MaterialsCraft — the tactile promise: paper, wax, brass, silk. An asymmetric
 * intro column (38.2%) sits beside a 2×2 material vitrine (61.8%). Token-palette
 * gradient fields carry a grain wash so they read as material, not flat plastic.
 */
const MATERIALS = [
  {
    name: 'Kâğıt',
    note: 'Lifleri görünen, dokusu parmak ucunda kalan pamuk kâğıtlar.',
    field: 'from-cherie-ivory via-cherie-paper to-cherie-mist',
    label: 'text-cherie-ink',
  },
  {
    name: 'Mühür Mumu',
    note: 'Her zarfın üstünde, monogramınızla soğuyan bir imza.',
    field: 'from-cherie-cherry via-cherie-burgundy to-cherie-velvet',
    label: 'text-cherie-ivory',
  },
  {
    name: 'Pirinç',
    note: 'Fırçalanmış pirinç detaylar; ışığı nazikçe tutan sıcak metal.',
    field: 'from-cherie-brass via-cherie-lace to-cherie-paper',
    label: 'text-cherie-ink',
  },
  {
    name: 'İpek Kurdele',
    note: 'Sözünüzü bağlayan iplik; kırmızının en asil düğümü.',
    field: 'from-cherie-burgundy via-cherie-cherry to-cherie-burgundy',
    label: 'text-cherie-ivory',
  },
] as const;

export function MaterialsCraft() {
  return (
    <SectionShell
      eyebrow="Zanaat"
      title="Lüks, dokunduğunuz yerde başlar."
      lede="Kâğıdın lifi, mumun ısısı, pirincin ağırlığı, ipeğin düğümü — hepsi elinizde anlam kazanır."
      className="bg-cherie-ivory"
    >
      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[1fr_1.618fr] lg:items-center">
        <Reveal>
          <p className="max-w-sm text-lg leading-8 text-cherie-soft-ink">
            Her ürün, adı anılmayan onlarca küçük karardan doğar: hangi kâğıt,
            hangi kırmızı, hangi kurdele. Biz o kararları sizin yerinize, sizin
            zevkinizle veriyoruz.
          </p>
          <div className="cd-rule mt-6 w-32" />
        </Reveal>

        <div className="grid grid-cols-2 gap-4">
          {MATERIALS.map((material, i) => (
            <Reveal key={material.name} delay={i * 0.08}>
              <figure className="group overflow-hidden rounded-card-lg border border-cherie-lace shadow-card">
                <div
                  className={`cd-grain relative aspect-[5/3] overflow-hidden bg-gradient-to-br ${material.field}`}
                >
                  <figcaption
                    className={`absolute inset-x-0 bottom-0 p-4 ${material.label}`}
                  >
                    <h3 className="font-display text-xl">{material.name}</h3>
                  </figcaption>
                </div>
                <p className="bg-cherie-ivory p-4 text-xs leading-5 text-cherie-soft-ink">
                  {material.note}
                </p>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
