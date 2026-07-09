'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { makeGlowTexture, makeSkyTexture } from './textures';

interface Stratum {
  pos: readonly [number, number, number];
  scale: readonly [number, number];
  mult: number;
  opacity: number;
  tone: 'lace' | 'paper' | 'brass';
}

/**
 * Painted-stage strata, far → near: two deep paper tones establish the
 * back wall of the stage, the lace layers drift mid-air, and a low ground
 * mist seats the scene. A faint brass atmosphere top-left carries the
 * key-light's warmth into the air itself.
 */
const STRATA: Stratum[] = [
  /* deep stage wall */
  { pos: [1.8, 2.2, -4.8], scale: [11, 4.2], mult: 0.06, opacity: 0.3, tone: 'paper' },
  { pos: [-2.4, -0.6, -4.4], scale: [10, 3.8], mult: 0.09, opacity: 0.26, tone: 'paper' },
  /* key-light warmth in the air, upper-left */
  { pos: [-3.2, 2.4, -4.0], scale: [7, 3.2], mult: 0.08, opacity: 0.32, tone: 'brass' },
  /* mid-air lace strata */
  { pos: [-2.6, 1.4, -3.6], scale: [7.5, 3.0], mult: 0.15, opacity: 0.38, tone: 'lace' },
  { pos: [2.8, 0.4, -3.0], scale: [8.5, 3.4], mult: 0.24, opacity: 0.32, tone: 'lace' },
  { pos: [-1.2, -1.5, -2.2], scale: [6.5, 2.6], mult: 0.34, opacity: 0.26, tone: 'lace' },
  /* ground mist seating the stage */
  { pos: [0.4, -2.3, -1.8], scale: [10, 2.2], mult: 0.18, opacity: 0.3, tone: 'lace' },
];

/**
 * Backdrop — the painted stage.
 *
 * Refinement pass: not flat fog — a layered space with a warm back wall,
 * airborne light, and a grounded floor of mist, each stratum drifting at
 * its own depth with the pointer.
 */
export function Backdrop({ parallaxRef }: SceneProps) {
  const sky = useMemo(() => makeSkyTexture(), []);
  const textures = useMemo(
    () => ({
      lace: makeGlowTexture('rgba(232,216,199,0.9)'),
      paper: makeGlowTexture('rgba(230,220,206,0.85)'),
      brass: makeGlowTexture('rgba(217,169,107,0.5)'),
    }),
    [],
  );
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(() => {
    const par = parallaxRef.current;
    STRATA.forEach((s, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      mesh.position.x = s.pos[0] + par.x * s.mult;
      mesh.position.y = s.pos[1] - par.y * s.mult * 0.7;
    });
  });

  return (
    <group>
      {/* sky plane */}
      <mesh position={[0, 0, -6]}>
        <planeGeometry args={[26, 15]} />
        <meshBasicMaterial map={sky} depthWrite={false} />
      </mesh>

      {/* painted strata */}
      {STRATA.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          position={[s.pos[0], s.pos[1], s.pos[2]]}
        >
          <planeGeometry args={[s.scale[0], s.scale[1]]} />
          <meshBasicMaterial
            map={textures[s.tone]}
            transparent
            opacity={s.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
