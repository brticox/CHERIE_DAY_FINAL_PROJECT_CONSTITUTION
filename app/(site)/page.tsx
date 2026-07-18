import { getHomeData } from '@/lib/home/home-data';
import { CursorField } from '@/lib/home/cursor-field';
import { HeroOverture } from '@/components/home/sections/HeroOverture';
import { BrandClarifier } from '@/components/home/sections/BrandClarifier';
import { OccasionDioramas } from '@/components/home/sections/OccasionDioramas';
import { ProductWorlds } from '@/components/home/sections/ProductWorlds';
import { FeaturedCollections } from '@/components/home/sections/FeaturedCollections';
import { PersonalizationSteps } from '@/components/home/sections/PersonalizationSteps';
import { DigitalInvite } from '@/components/home/sections/DigitalInvite';
import { OrganizationServices } from '@/components/home/sections/OrganizationServices';
import { CityAvailability } from '@/components/home/sections/CityAvailability';
import { MaterialsCraft } from '@/components/home/sections/MaterialsCraft';
import { MemoriesAlbum } from '@/components/home/sections/MemoriesAlbum';
import { GalleryProof } from '@/components/home/sections/GalleryProof';
import { QuoteCta } from '@/components/home/sections/QuoteCta';
import { FaqPreview } from '@/components/home/sections/FaqPreview';
import { getPageBySlug, homeSectionVisibility } from '@/lib/data/pages';

/**
 * Homepage — "Bir Dokunuş, Bütün Bir Gün" (Phase 2A: cinematic foundation).
 *
 * Awe → understanding → desire → trust → action, per the approved
 * pre-production lock. All narrative content is SSR HTML over seed data;
 * dimensional life comes from the CursorField's CSS-var parallax. The
 * hero / product-worlds / services / cta-ribbon StageFrames are reserved
 * slots for the Phase 3–4 R3F stages.
 */
export default async function HomePage() {
  const [data, cmsPage] = await Promise.all([getHomeData(), getPageBySlug('home')]);
  const visible = homeSectionVisibility(cmsPage?.body);

  return (
    <CursorField>
      {/* AWE */}
      {visible.hero && <HeroOverture />}

      {/* UNDERSTANDING */}
      <BrandClarifier />
      <OccasionDioramas occasions={data.occasions} />

      {/* DESIRE */}
      <ProductWorlds worlds={data.worlds} />
      <FeaturedCollections collections={data.featuredCollections} />
      <PersonalizationSteps />
      <DigitalInvite />

      {/* TRUST */}
      <OrganizationServices services={data.services} />
      {visible.coverage && <CityAvailability cities={data.cities} />}
      <MaterialsCraft />
      <MemoriesAlbum />
      {visible.testimonials && <GalleryProof testimonials={data.testimonials} />}

      {/* ACTION */}
      <QuoteCta />
      {visible.faq && <FaqPreview faqs={data.faqs} />}
    </CursorField>
  );
}
