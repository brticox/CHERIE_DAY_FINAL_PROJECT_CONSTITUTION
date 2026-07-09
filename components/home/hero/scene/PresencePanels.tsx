'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { makeFigureTexture, makePresenceTexture } from './textures';
import { clamp01, easeInOut, lerp, window01 } from './math';

interface Layer {
  tex: THREE.CanvasTexture;
  size: [number, number];
  pos: [number, number, number];
  opacity: number;
  additive: boolean;
}

/**
 * PresencePanels — the bride and groom as ceremonial presences.
 *
 * Phase 2C blocking: each side now reads narratively.
 *  Bride (left)  — a soft ivory GOWN aura (veil narrowing at top, skirt
 *                  flaring at base) wrapped in a wider translucent veil halo.
 *  Groom (right) — a warm, darker SUIT column, slimmer and grounded, with a
 *                  quiet shoulder aura behind it.
 * Still abstract, feathered light — no head, no limbs, no mannequin.
 */
function Presence({
  side,
  buildLayers,
  phase,
  progressRef,
  parallaxRef,
}: SceneProps & {
  side: -1 | 1;
  phase: number;
  buildLayers: () => Layer[];
}) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<Array<THREE.MeshBasicMaterial | null>>([]);
  const layers = useMemo(buildLayers, [buildLayers]);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const par = parallaxRef.current;
    const g = group.current;
    if (!g) return;

    const enter = easeInOut(window01(p, 0.0, 0.16));
    const approach = easeInOut(window01(p, 0.15, 0.55));
    /* F1 blocking: presences settle onto the left/right third centers
       (~±2.2 world units ≈ frame thirds at this camera), leaning inward */
    const baseX = side * lerp(3.1, 2.2, enter);
    const lean = side * lerp(0, -0.35, approach);

    g.position.x = baseX + lean + par.x * 0.28;
    g.position.y = -0.08 + Math.sin(clock.elapsedTime * 0.4 + phase) * 0.05 - par.y * 0.18;

    const visible = clamp01(enter * 1.15);
    layers.forEach((l, i) => {
      const m = mats.current[i];
      if (m) m.opacity = l.opacity * visible;
    });
  });

  return (
    <group ref={group} position={[side * 3.05, -0.15, -0.6]}>
      {layers.map((l, i) => (
        <mesh key={i} position={l.pos}>
          <planeGeometry args={l.size} />
          <meshBasicMaterial
            ref={(el) => {
              mats.current[i] = el;
            }}
            map={l.tex}
            transparent
            opacity={0}
            depthWrite={false}
            blending={l.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

export function PresencePanels(props: SceneProps) {
  const brideLayers = useMemo<() => Layer[]>(
    () => () => [
      // wide translucent veil halo (behind) — F1: the veil dissolves into light.
      // Normal blending: additive over the bright sky blew out to a hot bar.
      {
        tex: makePresenceTexture('#FBF8F2', '#F0E2D2', '#E6D2BD'),
        size: [3.0, 5.2],
        pos: [0.08, 0.1, -0.3],
        opacity: 0.35,
        additive: false,
      },
      // the gown core — widened so the bride owns the left third; tones
      // deepened so ivory reads against the ivory sky (not camouflaged)
      {
        tex: makeFigureTexture('gown', '#FBF6EC', '#EFDCC9', '#DCC3A9'),
        size: [2.3, 4.6],
        pos: [0, 0, 0],
        opacity: 0.95,
        additive: false,
      },
      // veil highlight catching the key light (front, offset in-ward)
      {
        tex: makeFigureTexture('gown', '#FFFEFA', '#FAF2E8', '#F2E4D6'),
        size: [1.3, 3.9],
        pos: [-0.2 * 1, 0.25, 0.14],
        opacity: 0.2,
        additive: true,
      },
    ],
    [],
  );

  const groomLayers = useMemo<() => Layer[]>(
    () => () => [
      // quiet shoulder aura (behind) — F1: the groom-side warm shadow
      {
        tex: makePresenceTexture('#E4D8C8', '#C2AB92', '#7C6857'),
        size: [2.5, 4.8],
        pos: [-0.06, 0.06, -0.3],
        opacity: 0.22,
        additive: false,
      },
      // the suit column — widened so the groom owns the right third
      {
        tex: makeFigureTexture('suit', '#EFE7DA', '#CBB69C', '#5E4B3E'),
        size: [1.7, 4.5],
        pos: [0, -0.05, 0],
        opacity: 0.88,
        additive: false,
      },
      // slim inner shadow (weight of the suit)
      {
        tex: makeFigureTexture('suit', '#8A7360', '#5C4A3C', '#37291F'),
        size: [0.8, 3.9],
        pos: [0.18, -0.1, 0.12],
        opacity: 0.45,
        additive: false,
      },
    ],
    [],
  );

  return (
    <>
      <Presence {...props} side={-1} phase={0} buildLayers={brideLayers} />
      <Presence {...props} side={1} phase={Math.PI / 2} buildLayers={groomLayers} />
    </>
  );
}
