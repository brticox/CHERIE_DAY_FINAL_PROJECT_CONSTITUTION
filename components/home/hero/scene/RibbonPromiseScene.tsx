'use client';

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { easing } from 'maath';

import { Backdrop } from './Backdrop';
import { PresencePanels } from './PresencePanels';
import { GestureStrokes } from './GestureStrokes';
import { RingTorus } from './RingTorus';
import { RibbonCurve } from './RibbonCurve';
import { MaisonObjects } from './MaisonObjects';
import { Particles } from './Particles';
import { Lights } from './Lights';
import { Effects } from './Effects';
import { clamp01, easeInOut } from './math';

export interface SceneProps {
  /** Scroll progress 0..1 (pinned runway). Read per-frame, never re-renders. */
  progressRef: RefObject<number>;
  /** Damped pointer (-1..1) shared by every layer. */
  parallaxRef: RefObject<{ x: number; y: number }>;
}

/**
 * Theatre.js note (Phase 6): every animated property in this scene is a pure
 * function of `progressRef.current`. That single scalar maps 1:1 onto a
 * Theatre `sequence.position`, so authored keyframes can replace the math
 * without touching the scene graph.
 */

/** One damped pointer writer per canvas — the WebGL CursorField. */
function PointerDriver({ parallaxRef }: { parallaxRef: SceneProps['parallaxRef'] }) {
  useFrame((state, delta) => {
    easing.damp(parallaxRef.current, 'x', state.pointer.x, 0.18, delta);
    easing.damp(parallaxRef.current, 'y', state.pointer.y, 0.18, delta);
  });
  return null;
}

/** Slow cinematic camera: one dolly-in, micro-tilt, breath of parallax. */
function CameraRig({ progressRef, parallaxRef }: SceneProps) {
  useFrame(({ camera }) => {
    const p = progressRef.current;
    const par = parallaxRef.current;
    const dolly = easeInOut(clamp01(p / 0.6));
    const settle = easeInOut(clamp01((p - 0.85) / 0.15)); // gentle pull-back at rest

    /* closer framing (less dead space); the composition sits a touch high */
    camera.position.z = 5.35 - 0.5 * dolly + 0.22 * settle;
    camera.position.x = par.x * 0.12;
    camera.position.y = 0.12 - par.y * 0.08;
    camera.lookAt(0, 0.12, 0);
    camera.rotation.z = par.x * 0.004; // ≤ ~0.25° — a breath, not a roll
  });
  return null;
}

/** Neutral studio reflections without any network asset (RoomEnvironment). */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

function SceneContents({ progressRef }: { progressRef: RefObject<number> }) {
  const parallaxRef = useRef({ x: 0, y: 0 });
  const scene: SceneProps = { progressRef, parallaxRef };

  return (
    <>
      <PointerDriver parallaxRef={parallaxRef} />
      <CameraRig {...scene} />
      <StudioEnvironment />
      <Lights {...scene} />

      <Backdrop {...scene} />
      <PresencePanels {...scene} />
      <GestureStrokes {...scene} />
      <RibbonCurve {...scene} />
      <RingTorus {...scene} />
      <MaisonObjects {...scene} />
      <Particles {...scene} />

      <Effects progressRef={progressRef} />
    </>
  );
}

/** Canvas root — mounted only via WebGLGuard + IntersectionObserver. */
export function RibbonPromiseCanvas({
  progressRef,
  eventSource,
}: {
  progressRef: RefObject<number>;
  /**
   * Optional pointer-event source. The homepage mounts the canvas inside a
   * pointer-events-none layer (the HTML overture must stay clickable), so
   * parallax listens on <body> instead of the canvas element.
   */
  eventSource?: HTMLElement;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 35, position: [0, 0, 6], near: 0.1, far: 40 }}
      onCreated={({ gl }) => gl.setClearColor('#FAF7F1')}
      eventSource={eventSource}
    >
      <SceneContents progressRef={progressRef} />
    </Canvas>
  );
}
