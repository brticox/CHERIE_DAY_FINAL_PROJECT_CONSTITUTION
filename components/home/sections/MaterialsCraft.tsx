import { ParallaxLayer } from '@/components/home/primitives/ParallaxLayer';
import { Reveal } from '@/components/home/primitives/Reveal';
import { SectionShell } from '@/components/home/primitives/SectionShell';

/**
 * MaterialsCraft — the tactile promise: paper, wax, brass, silk.
 * Phase 2A uses token-palette gradient fields as texture stand-ins;
 * Phase 5 replaces each field with an art-directed macro photograph.
 * The silk tile IS the ribbon seen up close — the narrative connector.
 */
const MATERIALS = [
  {
    name: 'Kâğıt',
    note: 'Lifleri görünen, dokusu elinizde kalan premium kâğıtlar.',
    field: 'from-cherie-ivory via-cherie-paper to-cherie-mist',
    depth: 3,
  },
  {
    name: 'Mühür Mumu',
    note: 'Her zarfın üzerinde, sizin monogramınızla soğuyan bir imza.',
    field: 'from-cherie-cherry via-cherie-burgundy to-cherie-velvet',
    depth: 5,
  },
  {
    name: 'Pirinç',
    note: 'Fırçalanmış pirinç detaylar; ışığı nazikçe tutar.',
    field: 'from-cherie-brass via-cherie-lace to-cherie-paper',
    depth: 7,
  },
  {
    name: 'İpek Kurdele',
    note: 'Sözünüzü bağlayan iplik; kırmızının en asil hâli.',
    field: 'from-cherie-burgundy via-cherie-cherry to-cherie-burgundy',
    depth: 9,
  },
] as const;

export function MaterialsCraft() {
  return (
    <SectionShell
      eyebrow="Zanaat"
      title="Kâğıdın, mührün, kurdelenin hikâyesi."
      lede="Lüks, malzemede başlar: dokunduğunuzda anlarsınız."
      className="bg-cherie-ivory"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MATERIALS.map((material, i) => (
          <Reveal key={material.name} delay={i * 0.1}>
            <figure className="group overflow-hidden rounded-card border border-cherie-lace shadow-card">
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* macro texture stand-in — drifts at its own depth */}
                <ParallaxLayer
                  aria-hidden
                  depth={material.depth}
                  className={`absolute -inset-4 bg-gradient-to-br ${material.field} transition-transform duration-card ease-cherie group-hover:scale-105`}
                />
                {/* grain hint */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 25% 25%, #1F1917 0.5px, transparent 0.5px), radial-gradient(circle at 75% 60%, #1F1917 0.4px, transparent 0.4px)',
                    backgroundSize: '14px 14px, 22px 22px',
                  }}
                />
              </div>
              <figcaption className="bg-cherie-ivory p-5">
                <h3 className="font-display text-xl text-cherie-ink">{material.name}</h3>
                <p className="mt-1.5 text-xs leading-5 text-cherie-soft-ink">{material.note}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
