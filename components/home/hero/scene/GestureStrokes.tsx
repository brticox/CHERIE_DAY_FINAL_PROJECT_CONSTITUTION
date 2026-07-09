'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { easeInOut, lerp, window01 } from './math';

/**
 * GestureStrokes — the reach of the promise.
 *
 * Phase 2C.2 blocking against F1: each side is no longer a single wire but a
 * small FAN of tapered light strokes — a lead "index" stroke, a shorter
 * "middle" stroke beneath it, and a low "thumb" hint — so the reach reads as
 * near-touch fingers while staying abstract (no hand geometry, no anatomy).
 * The lead tips converge on the ring and stop a breath outside its band
 * (ring radius 0.115 → tips rest at ±~0.17): the gap never fully closes,
 * exactly as in F1 where the fingertips remain ~a breath apart.
 */

interface FingerSpec {
  /** start/tip offsets relative to the side's shoulder → ring path */
  startDY: number;
  tipGap: number; // final distance of the tip from center x=0
  tipDY: number;
  radius: number;
  reach: number; // 1 = full reach of the lead finger
}

/* lead index finger, supporting middle finger, low thumb hint */
const FINGERS: FingerSpec[] = [
  { startDY: 0.0, tipGap: 0.17, tipDY: 0.0, radius: 0.0075, reach: 1 },
  { startDY: -0.09, tipGap: 0.3, tipDY: -0.07, radius: 0.006, reach: 0.86 },
  { startDY: -0.2, tipGap: 0.46, tipDY: -0.17, radius: 0.005, reach: 0.7 },
];

function Stroke({
  side,
  progressRef,
  parallaxRef,
}: SceneProps & { side: -1 | 1 }) {
  const group = useRef<THREE.Group>(null);
  const tubes = useRef<Array<THREE.Mesh | null>>([]);
  const shoulder = useRef<THREE.Mesh>(null);
  const lastKey = useRef(-1);

  useFrame(() => {
    const p = progressRef.current;
    const par = parallaxRef.current;
    const g = group.current;
    if (!g) return;

    const enter = easeInOut(window01(p, 0.05, 0.22));
    const approach = easeInOut(window01(p, 0.15, 0.6));
    const touch = easeInOut(window01(p, 0.6, 0.66));

    const key = Math.round(p * 220);
    if (key !== lastKey.current) {
      lastKey.current = key;

      /* the wrist/shoulder rises from the presence (thirds → center) */
      const sx = side * lerp(2.15, 1.62, approach);
      const sy = lerp(0.48, 0.24, approach);

      FINGERS.forEach((f, i) => {
        const t = tubes.current[i];
        if (!t) return;

        /* each finger converges toward the ring; the lead finger closes to
           its near-touch gap at the touch beat, trailing fingers stay back */
        const reachNow = approach * f.reach;
        const rawTip = lerp(1.5, f.tipGap, reachNow);
        const tipX = side * lerp(rawTip, f.tipGap, touch * f.reach);
        const tipY = lerp(0.3, f.tipDY + 0.02, reachNow);

        /* control point bows the stroke gently downward toward the ring */
        const cx = side * lerp(1.0, 0.55, approach);
        const cy = lerp(0.14, f.tipDY * 0.5 - 0.03, approach);

        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(sx, sy + f.startDY, -0.05),
          new THREE.Vector3(cx, cy, 0.0),
          new THREE.Vector3(tipX, tipY, 0.03),
        );
        const next = new THREE.TubeGeometry(curve, 32, f.radius, 8, false);
        t.geometry.dispose();
        t.geometry = next;
      });

      if (shoulder.current) shoulder.current.position.set(sx, sy, -0.05);
    }

    g.position.x = par.x * 0.12;
    g.position.y = -par.y * 0.09;

    const op = 0.8 * enter;
    tubes.current.forEach((t, i) => {
      if (t) {
        (t.material as THREE.MeshStandardMaterial).opacity =
          op * (i === 0 ? 1 : 0.7 - i * 0.12);
      }
    });
    if (shoulder.current) {
      (shoulder.current.material as THREE.MeshStandardMaterial).opacity = op * 0.8;
    }
  });

  return (
    <group ref={group}>
      {FINGERS.map((f, i) => (
        <mesh
          key={i}
          ref={(el) => {
            tubes.current[i] = el;
          }}
        >
          <tubeGeometry
            args={[
              new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(side * 2.15, 0.48 + f.startDY, -0.05),
                new THREE.Vector3(side * 1.0, 0.14, 0),
                new THREE.Vector3(side * 1.5, 0.3, 0.03),
              ),
              32,
              f.radius,
              8,
              false,
            ]}
          />
          <meshStandardMaterial
            color="#F6EFE4"
            emissive="#C9A36B"
            emissiveIntensity={0.14}
            roughness={0.8}
            metalness={0}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
      {/* soft shoulder cap → the organic tapered origin (the wrist of light) */}
      <mesh ref={shoulder}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial
          color="#F6EFE4"
          emissive="#C9A36B"
          emissiveIntensity={0.14}
          roughness={0.85}
          metalness={0}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}

export function GestureStrokes(props: SceneProps) {
  return (
    <>
      <Stroke {...props} side={-1} />
      <Stroke {...props} side={1} />
    </>
  );
}
