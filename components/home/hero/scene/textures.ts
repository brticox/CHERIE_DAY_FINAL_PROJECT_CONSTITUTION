'use client';

import * as THREE from 'three';

/**
 * Procedural CanvasTextures for the lab's painterly placeholders.
 * No image assets — everything is generated at runtime from the token
 * palette, keeping Phase 2B asset-free until the Visual Reference Gates.
 */

/** Soft radial glow disc (clouds, auras, particle sprite). */
export function makeGlowTexture(
  inner: string,
  outer = 'rgba(0,0,0,0)',
  size = 256,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2,
  );
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Painterly presence panel: a vertical warm gradient, feathered to soft
 * edges by an elliptical mask — a luminous "presence of light", never a
 * body or silhouette (visual rules, pre-production lock §5).
 */
export function makePresenceTexture(
  top: string,
  mid: string,
  bottom: string,
  width = 256,
  height = 512,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, top);
  g.addColorStop(0.45, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  /* feather to soft elliptical edges */
  ctx.globalCompositeOperation = 'destination-in';
  const mask = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, height / 2,
  );
  mask.addColorStop(0, 'rgba(255,255,255,1)');
  mask.addColorStop(0.55, 'rgba(255,255,255,0.9)');
  mask.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(width / height, 1);
  ctx.translate(-width / 2, -height / 2);
  ctx.fillStyle = mask;
  ctx.fillRect(-width, 0, width * 3, height);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Abstract ceremonial-figure aura — a soft, feathered luminous silhouette,
 * NOT a body. Built from stacked horizontal soft bands whose width follows a
 * profile: a 'gown' narrows at the top (veil) and flares to a bell at the
 * base; a 'suit' is a slimmer, straighter warm column. Heavily feathered so
 * it reads as a presence of light, never anatomy (no head, no limbs).
 */
export function makeFigureTexture(
  kind: 'gown' | 'suit',
  top: string,
  mid: string,
  bottom: string,
  width = 256,
  height = 512,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const cx = width / 2;

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, top);
  grad.addColorStop(0.5, mid);
  grad.addColorStop(1, bottom);

  const smooth = (t: number) => t * t * (3 - 2 * t);

  for (let y = 0; y < height; y += 2) {
    const t = y / height; // 0 top → 1 bottom
    let halfW: number;
    if (kind === 'gown') {
      // narrow veil top → soft shoulders → flaring bell skirt
      const veil = 0.16 + 0.14 * smooth(Math.min(1, t / 0.28));
      const flare = 0.5 * smooth(Math.max(0, (t - 0.42) / 0.58));
      halfW = (veil + flare) * width * 0.5;
    } else {
      // slim, mostly straight warm column, gentle base
      halfW = (0.2 + 0.1 * smooth(Math.max(0, (t - 0.5) / 0.5))) * width * 0.5;
    }

    // vertical fade at very top/bottom so the form dissolves into light
    const vFade =
      smooth(Math.min(1, t / 0.12)) * smooth(Math.min(1, (1 - t) / 0.14));

    const band = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
    band.addColorStop(0, 'rgba(0,0,0,0)');
    band.addColorStop(0.5, 'rgba(0,0,0,1)');
    band.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalAlpha = vFade;
    ctx.fillStyle = band;
    ctx.fillRect(cx - halfW, y, halfW * 2, 2);
  }

  // tint the built alpha mask with the vertical color gradient
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Vertical sky gradient for the backdrop plane. */
export function makeSkyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#FAF7F1'); // ivory
  g.addColorStop(0.55, '#EFE8DE'); // mist
  g.addColorStop(1, '#F3EDE3'); // paper
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
