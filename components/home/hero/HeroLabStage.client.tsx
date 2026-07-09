'use client';

import { HeroPoster } from '@/components/home/hero/HeroPoster';
import { HeroStage } from '@/components/home/hero/HeroStage.client';

/**
 * HeroLabStage — the /hero-lab workshop host (Phase 3: thin wrapper).
 *
 * The engine lives in HeroStage.client.tsx, shared with the homepage.
 * The lab keeps its 400vh runway, the HUD, the permanent ?p= override,
 * and the typographic HeroPoster — behavior identical to Phase 2C.2.
 */
export function HeroLabStage() {
  return (
    <HeroStage runwayVh={400} hud debug>
      <HeroPoster />
    </HeroStage>
  );
}
