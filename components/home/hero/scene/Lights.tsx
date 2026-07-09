'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { pulse, window01 } from './math';

/**
 * Lights — the candle logic, exposure-controlled.
 *
 * Refinement pass: the key and fill are pulled down so the ivory space
 * reads soft and premium, never blown out. The promise light stays a faint
 * warmth until the touch, flares gently, then settles to a low afterglow.
 */
export function Lights({ progressRef }: SceneProps) {
  const promise = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const p = progressRef.current;
    if (!promise.current) return;

    const flare = pulse(p, 0.58, 0.78); // the touch
    const afterglow = window01(p, 0.66, 0.82) * 0.35; // quiet warmth after birth
    promise.current.intensity = 0.12 + flare * 2.1 + afterglow;
  });

  return (
    <>
      {/* warm key, upper-left (single direction — candlelight logic) */}
      <directionalLight position={[-4, 5, 4]} intensity={1.3} color="#FFF1DC" />
      {/* soft ambient fill */}
      <ambientLight intensity={0.4} color="#F5E8D8" />
      {/* the promise light at center */}
      <pointLight
        ref={promise}
        position={[0, 0.05, 0.6]}
        intensity={0.12}
        color="#D9A96B"
        distance={6.5}
        decay={2}
      />
    </>
  );
}
