'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import type { SceneProps } from './RibbonPromiseScene';
import { easeOut, window01 } from './math';
import { makeGlowTexture } from './textures';

type Kind = 'invitation' | 'seal' | 'gift' | 'tray' | 'candle';

interface Spec {
  key: string;
  kind: Kind;
  birth: number;
  /** authored rest position in the ceremonial constellation */
  rest: [number, number, number];
  baseRot: [number, number, number];
}

/**
 * The ceremonial constellation, re-blocked against F1 (Phase 2C.2):
 * F1 places the envelope upper-left of the ring, the candle upper-right,
 * a gift at the right by the ribbon's end, and smaller tokens below.
 * Mapping (screen thirds, ring at exact center):
 *  invitation — upper-left of the ring (F1's sealed envelope position);
 *  wax seal   — below the invitation, left of the ring (closing the letter);
 *  candle     — upper-right of the ring (F1's brass chamberstick position);
 *  gift       — right of the ring, at the ribbon's end (gift↔ribbon);
 *  tray       — lower-center, grounding the constellation under the light.
 */
const SPECS: Spec[] = [
  { key: 'davetiye', kind: 'invitation', birth: 0.6, rest: [-1.15, 0.72, 0.08], baseRot: [0.14, 0.32, 0.06] },
  { key: 'mum', kind: 'candle', birth: 0.63, rest: [0.98, 0.78, -0.08], baseRot: [0, 0, 0] },
  { key: 'muhur', kind: 'seal', birth: 0.67, rest: [-1.42, 0.02, 0.2], baseRot: [0.55, 0, 0.1] },
  { key: 'hediye', kind: 'gift', birth: 0.7, rest: [1.42, 0.22, 0.12], baseRot: [0.12, 0.5, 0] },
  { key: 'tepsi', kind: 'tray', birth: 0.73, rest: [0.05, -0.82, 0.05], baseRot: [1.12, 0, 0.06] },
];

/* ── procedural, readable placeholder forms (no final assets) ──
   Every form must READ as its object at a glance: envelope with flap and
   seal, crested wax seal, gift with lid + ribbon cross + bow, brass
   söz/nişan tray with tea glasses and ring cushion, candle in a brass
   chamberstick. Gate-approved GLBs replace these in Phase 5. */

function Invitation() {
  return (
    /* scaled up + warmed so ivory paper separates from the ivory sky */
    <group scale={1.3}>
      {/* envelope body */}
      <mesh>
        <boxGeometry args={[0.36, 0.24, 0.012]} />
        <meshStandardMaterial color="#F2E9D9" roughness={0.72} metalness={0} />
      </mesh>
      {/* burgundy liner peeking along the top edge (F1's envelope) */}
      <mesh position={[0, 0.108, 0.002]}>
        <boxGeometry args={[0.352, 0.026, 0.014]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.6} metalness={0.02} />
      </mesh>
      {/* V flap: two angled ivory strips meeting at the center */}
      <mesh position={[-0.09, 0.045, 0.009]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.215, 0.014, 0.003]} />
        <meshStandardMaterial color="#EFE7DA" roughness={0.75} metalness={0} />
      </mesh>
      <mesh position={[0.09, 0.045, 0.009]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.215, 0.014, 0.003]} />
        <meshStandardMaterial color="#EFE7DA" roughness={0.75} metalness={0} />
      </mesh>
      {/* burgundy wax dot where the flap point closes */}
      <mesh position={[0, -0.005, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.035, 0.012, 20]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.5} metalness={0.05} />
      </mesh>
      {/* subtle brass border line near the bottom edge */}
      <mesh position={[0, -0.095, 0.008]}>
        <boxGeometry args={[0.3, 0.008, 0.002]} />
        <meshStandardMaterial color="#B08A57" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
}

function WaxSeal() {
  const petals = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return { a, x: Math.cos(a) * 0.052, y: Math.sin(a) * 0.052 };
    });
  }, []);
  return (
    <group>
      {/* irregular burgundy disc (two offset cylinders → poured-wax edge) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.095, 0.1, 0.024, 32]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.5} metalness={0.05} />
      </mesh>
      <mesh position={[0.012, -0.008, -0.004]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.088, 0.092, 0.02, 28]} />
        <meshStandardMaterial color="#7A1826" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* embossed crest: raised center boss + radial petals + rim ring */}
      <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.03, 0.014, 20]} />
        <meshStandardMaterial color="#701522" roughness={0.42} metalness={0.08} />
      </mesh>
      {petals.map((pt, i) => (
        <mesh
          key={i}
          position={[pt.x, pt.y, 0.014]}
          rotation={[Math.PI / 2, 0, pt.a]}
        >
          <boxGeometry args={[0.034, 0.008, 0.01]} />
          <meshStandardMaterial color="#701522" roughness={0.45} metalness={0.08} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.013]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.072, 0.005, 10, 36]} />
        <meshStandardMaterial color="#701522" roughness={0.45} metalness={0.08} />
      </mesh>
    </group>
  );
}

function GiftBox() {
  return (
    <group>
      {/* box body */}
      <mesh position={[0, -0.015, 0]}>
        <boxGeometry args={[0.18, 0.15, 0.18]} />
        <meshStandardMaterial color="#F3EDE3" roughness={0.6} metalness={0} />
      </mesh>
      {/* lid, slightly proud of the body */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.196, 0.035, 0.196]} />
        <meshStandardMaterial color="#EFE7DA" roughness={0.58} metalness={0} />
      </mesh>
      {/* ribbon cross — burgundy silk over body + lid */}
      <mesh>
        <boxGeometry args={[0.2, 0.21, 0.04]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.04, 0.21, 0.2]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.45} metalness={0.05} />
      </mesh>
      {/* bow: two loops + knot on the lid */}
      <mesh position={[-0.032, 0.1, 0]} rotation={[0, 0, 0.6]}>
        <torusGeometry args={[0.026, 0.011, 10, 20]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[0.032, 0.1, 0]} rotation={[0, 0, -0.6]}>
        <torusGeometry args={[0.026, 0.011, 10, 20]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <sphereGeometry args={[0.016, 10, 10]} />
        <meshStandardMaterial color="#7A1826" roughness={0.5} metalness={0.05} />
      </mesh>
    </group>
  );
}

function Tray() {
  return (
    <group>
      {/* shallow brass tray body */}
      <mesh>
        <cylinderGeometry args={[0.24, 0.22, 0.018, 48]} />
        <meshStandardMaterial color="#B08A57" roughness={0.32} metalness={0.9} envMapIntensity={1.1} />
      </mesh>
      {/* raised rim — rotated flat to crown the tray edge */}
      <mesh position={[0, 0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.225, 0.014, 16, 48]} />
        <meshStandardMaterial color="#C39A63" roughness={0.28} metalness={0.95} envMapIntensity={1.2} />
      </mesh>
      {/* inner shine disc */}
      <mesh position={[0, 0.011, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.002, 40]} />
        <meshStandardMaterial color="#D9BE8E" roughness={0.18} metalness={0.85} envMapIntensity={1.3} />
      </mesh>
      {/* two tea glasses (söz/nişan service) — slim waisted cylinders */}
      <mesh position={[-0.085, 0.045, -0.03]}>
        <cylinderGeometry args={[0.026, 0.018, 0.07, 16]} />
        <meshStandardMaterial
          color="#EADFCE"
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[0.085, 0.045, -0.03]}>
        <cylinderGeometry args={[0.026, 0.018, 0.07, 16]} />
        <meshStandardMaterial
          color="#EADFCE"
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* burgundy velvet ring cushion at the front of the tray */}
      <mesh position={[0, 0.03, 0.09]}>
        <boxGeometry args={[0.09, 0.035, 0.07]} />
        <meshStandardMaterial color="#8F1D2C" roughness={0.85} metalness={0} />
      </mesh>
      {/* the two rings resting on the cushion */}
      <mesh position={[-0.016, 0.055, 0.09]} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[0.02, 0.005, 10, 24]} />
        <meshStandardMaterial color="#C39A63" roughness={0.25} metalness={0.95} envMapIntensity={1.2} />
      </mesh>
      <mesh position={[0.016, 0.055, 0.09]} rotation={[Math.PI / 2.3, 0, 0.4]}>
        <torusGeometry args={[0.02, 0.005, 10, 24]} />
        <meshStandardMaterial color="#C39A63" roughness={0.25} metalness={0.95} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}

function Candle({ glow }: { glow: THREE.CanvasTexture }) {
  const flame = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (flame.current) {
      const f = 1 + Math.sin(clock.elapsedTime * 6) * 0.06;
      flame.current.scale.set(1, f, 1);
    }
  });
  return (
    <group>
      {/* brass chamberstick: drip pan + stem socket (F1's candle holder) */}
      <mesh position={[0, -0.19, 0]}>
        <cylinderGeometry args={[0.11, 0.12, 0.014, 32]} />
        <meshStandardMaterial color="#B08A57" roughness={0.32} metalness={0.9} envMapIntensity={1.1} />
      </mesh>
      <mesh position={[0, -0.165, 0]}>
        <cylinderGeometry args={[0.055, 0.07, 0.045, 24]} />
        <meshStandardMaterial color="#C39A63" roughness={0.3} metalness={0.92} envMapIntensity={1.15} />
      </mesh>
      {/* ivory pillar */}
      <mesh>
        <cylinderGeometry args={[0.045, 0.05, 0.32, 24]} />
        <meshStandardMaterial color="#F6F0E6" roughness={0.7} metalness={0} />
      </mesh>
      {/* wick */}
      <mesh position={[0, 0.168, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.018, 6]} />
        <meshStandardMaterial color="#4A3A2C" roughness={0.9} metalness={0} />
      </mesh>
      {/* flame */}
      <mesh ref={flame} position={[0, 0.2, 0]}>
        <coneGeometry args={[0.018, 0.06, 12]} />
        <meshStandardMaterial color="#FFE7B8" emissive="#F0B450" emissiveIntensity={2.4} roughness={1} />
      </mesh>
      {/* warm glow halo */}
      <mesh position={[0, 0.21, 0.02]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial map={glow} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function ObjectForm({ kind, glow }: { kind: Kind; glow: THREE.CanvasTexture }) {
  switch (kind) {
    case 'invitation':
      return <Invitation />;
    case 'seal':
      return <WaxSeal />;
    case 'gift':
      return <GiftBox />;
    case 'tray':
      return <Tray />;
    case 'candle':
      return <Candle glow={glow} />;
  }
}

function BornObject({
  spec,
  glow,
  progressRef,
  parallaxRef,
}: SceneProps & { spec: Spec; glow: THREE.CanvasTexture }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = progressRef.current;
    const par = parallaxRef.current;
    const g = group.current;
    if (!g) return;

    const born = easeOut(window01(p, spec.birth, spec.birth + 0.16));
    g.visible = born > 0.001;
    if (!g.visible) return;

    const lift = Math.sin(Math.PI * born) * 0.14; // gentle arc mid-flight
    g.position.set(
      spec.rest[0] * born + par.x * 0.18,
      spec.rest[1] * born + lift - par.y * 0.12,
      0.1 + spec.rest[2] * born,
    );
    g.scale.setScalar(born);
    /* gentle oscillation around the authored pose — never a full spin, so
       flat objects (the invitation) can't drift edge-on and vanish */
    g.rotation.set(
      spec.baseRot[0] + Math.sin(state.clock.elapsedTime * 0.3 + spec.birth * 18) * 0.03,
      spec.baseRot[1] + Math.sin(state.clock.elapsedTime * 0.45 + spec.birth * 24) * 0.09,
      spec.baseRot[2],
    );
  });

  return (
    <group ref={group} visible={false}>
      <ObjectForm kind={spec.kind} glow={glow} />
    </group>
  );
}

/**
 * MaisonObjects — the objects of the day, born from the light of the touch,
 * as readable symbolic placeholders (invitation, wax seal, gift, tray,
 * candle) in the F1 ceremonial constellation. Gate-approved GLBs will
 * replace these forms on the same positions/arcs in Phase 5.
 */
export function MaisonObjects(props: SceneProps) {
  const glow = useMemo(() => makeGlowTexture('rgba(240,180,80,0.9)'), []);
  return (
    <>
      {SPECS.map((spec) => (
        <BornObject key={spec.key} spec={spec} glow={glow} {...props} />
      ))}
    </>
  );
}
