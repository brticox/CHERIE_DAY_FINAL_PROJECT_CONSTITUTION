'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { easeInOut, lerp, window01 } from './math';

/**
 * RibbonCurve — the red silk connector.
 *
 * Refinement pass: a slim silk thread, not a tube. MeshPhysicalMaterial with
 * sheen (the anisotropic-fabric highlight) and near-zero metalness kills the
 * plastic specular; the drape uses a longer, softer easing window so tension
 * arrives gracefully, and the final tautening is a gentle settle, not a snap.
 */
export function RibbonCurve({ progressRef, parallaxRef }: SceneProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const lastKey = useRef(-1);

  useFrame(() => {
    const p = progressRef.current;
    const par = parallaxRef.current;
    const m = mesh.current;
    if (!m) return;

    const key = Math.round(p * 250);
    if (key !== lastKey.current) {
      lastKey.current = key;

      const approach = easeInOut(window01(p, 0.15, 0.62));
      const touch = easeInOut(window01(p, 0.62, 0.72));

      /* F1 blocking: the silk spans presence-to-presence (ends live at the
         wrists of the gesture strokes) and its final drape passes just UNDER
         the ring (ring center y≈0.02, band r=0.115 → under-pass ≈ -0.16),
         tucking BEHIND it at center so the jewel stays in front. */
      const endX = lerp(2.35, 1.95, approach);
      const endY = lerp(0.34, 0.22, approach);
      const dip = lerp(-1.05, -0.3, approach) + touch * 0.14; // slack → grace

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-endX, endY, -0.12),
        new THREE.Vector3(-endX * 0.5, dip * 0.78, 0.0),
        new THREE.Vector3(0, dip, -0.08),
        new THREE.Vector3(endX * 0.5, dip * 0.78, 0.0),
        new THREE.Vector3(endX, endY, -0.12),
      ]);

      const next = new THREE.TubeGeometry(curve, 120, 0.016, 16, false);
      m.geometry.dispose();
      m.geometry = next;
    }

    /* flatten the round tube into an elliptical silk band facing camera */
    m.scale.set(1, 1, 0.4);

    /* the silk breathes with the pointer, one plane behind the ring */
    m.position.x = par.x * 0.18;
    m.position.y = -par.y * 0.12;
  });

  return (
    <mesh ref={mesh}>
      <tubeGeometry
        args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(-2.3, 0.34, -0.12),
            new THREE.Vector3(0, -1.05, 0.05),
            new THREE.Vector3(2.3, 0.34, -0.12),
          ]),
          96,
          0.011,
          12,
          false,
        ]}
      />
      {/* silk: sheen highlight, matte body, no plastic gloss */}
      <meshPhysicalMaterial
        color="#8F1D2C"
        roughness={0.58}
        metalness={0}
        sheen={1}
        sheenColor="#D9A96B"
        sheenRoughness={0.45}
        specularIntensity={0.25}
        envMapIntensity={0.35}
        emissive="#4A0E17"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}
