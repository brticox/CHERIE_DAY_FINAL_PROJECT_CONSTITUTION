'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { easeOut, pulse, window01 } from './math';
import { makeGlowTexture } from './textures';

const COUNT = 180; // pre-production lock §7: ≤200, one emission only

/**
 * Particles — the single burst of the page: warm gold motes released at the
 * touch (progress 0.55–0.8), expanding outward and drifting up, then gone.
 */
export function Particles({ progressRef }: SceneProps) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.PointsMaterial>(null);

  const sprite = useMemo(() => makeGlowTexture('rgba(217,169,107,1)'), []);

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      /* random point on a soft shell around the ring */
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.15 + Math.random() * 0.3;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      arr[i * 3 + 2] = r * Math.cos(phi) * 0.5;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const p = progressRef.current;
    const g = group.current;
    if (!g || !mat.current) return;

    const t = window01(p, 0.55, 0.8);
    const alive = t > 0.001 && t < 0.999;

    g.visible = alive;
    if (!alive) return;

    const spread = easeOut(t);
    g.scale.setScalar(0.4 + spread * 2.2);
    g.position.y = 0.02 + spread * 0.5;
    g.rotation.y = state.clock.elapsedTime * 0.08;
    mat.current.opacity = pulse(p, 0.55, 0.8) * 0.85;
  });

  return (
    <group ref={group} visible={false}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={mat}
          map={sprite}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#D9A96B"
        />
      </points>
    </group>
  );
}
