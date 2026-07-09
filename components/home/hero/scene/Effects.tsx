'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { BloomEffect } from 'postprocessing';

import type { SceneProps } from './RibbonPromiseScene';
import { pulse } from './math';

/**
 * Effects — climax-scoped postprocessing.
 *
 * Refinement pass: bloom is no longer a constant wash. It idles near zero
 * (the ivory scene stays matte and premium) and blooms only around the
 * touch (progress ~0.55–0.85), driven per-frame from the scroll ref.
 * A whisper of vignette holds the frame.
 */
export function Effects({ progressRef }: Pick<SceneProps, 'progressRef'>) {
  const bloom = useRef<BloomEffect>(null);

  useFrame(() => {
    const p = progressRef.current;
    if (bloom.current) {
      bloom.current.intensity = 0.08 + pulse(p, 0.52, 0.88) * 0.5;
    }
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={bloom}
        mipmapBlur
        intensity={0.08}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.18}
        radius={0.7}
      />
      <Vignette eskil={false} offset={0.3} darkness={0.34} />
    </EffectComposer>
  );
}
