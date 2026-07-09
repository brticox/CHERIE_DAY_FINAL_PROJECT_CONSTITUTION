'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { easeOut, lerp, pulse, window01 } from './math';

/**
 * RingTorus — the jewel of the scene.
 *
 * Refinement pass: true jewelry proportions (a fine band, not a toy donut),
 * MeshPhysicalMaterial with clearcoat for the polished-brass finish, calmer
 * flare, slower turn, and a more graceful presentation tilt.
 */
export function RingTorus({ progressRef, parallaxRef }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((_, delta) => {
    const p = progressRef.current;
    const par = parallaxRef.current;
    const g = group.current;
    if (!g) return;

    const grow = easeOut(window01(p, 0.1, 0.55));
    const flare = pulse(p, 0.58, 0.78);

    g.scale.setScalar(lerp(0.6, 1, grow));
    g.rotation.y += delta * 0.16;
    g.position.x = par.x * 0.06; // the jewel barely moves
    g.position.y = 0.02 - par.y * 0.04;

    if (mat.current) {
      mat.current.emissiveIntensity = 0.05 + grow * 0.15 + flare * 0.85;
    }
  });

  return (
    <group ref={group} position={[0, 0.02, 0]} rotation={[0.5, 0, 0.08]}>
      <mesh>
        {/* fine band: 0.115 radius, 0.02 profile — jewelry, not a torus prop */}
        <torusGeometry args={[0.115, 0.02, 32, 96]} />
        <meshPhysicalMaterial
          ref={mat}
          color="#B08A57"
          metalness={0.92}
          roughness={0.34}
          clearcoat={0.6}
          clearcoatRoughness={0.35}
          envMapIntensity={1.0}
          emissive="#B08A57"
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
}
