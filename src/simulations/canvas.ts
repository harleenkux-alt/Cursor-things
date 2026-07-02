import type { CvdType, VisualConditionId } from '@/types/experience';
import { CVD_MATRICES, applyMatrixToRgb } from './colorMatrices';
import { VISUAL_CONDITIONS, type Overlay } from './visualConditions';

/**
 * Browser-side image processing for the visual simulations. Everything happens
 * on an in-plugin canvas — the Figma design is never modified.
 */

/** Reference width the blur values in specs are tuned for. */
const REFERENCE_WIDTH = 1000;

export function loadImageFromBytes(bytes: Uint8Array): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([bytes as BlobPart], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode preview image.'));
    };
    img.src = url;
  });
}

export interface RenderOptions {
  condition?: VisualConditionId;
  cvd?: CvdType;
}

/** Deterministic PRNG so overlays (e.g. floaters) stay stable across renders. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Render the source image into `target` applying an optional vision condition
 * and/or CVD transform. Returns the render duration in ms.
 */
export function renderVisual(
  source: CanvasImageSource,
  target: HTMLCanvasElement,
  width: number,
  height: number,
  options: RenderOptions,
): number {
  const start = performance.now();
  target.width = width;
  target.height = height;
  const ctx = target.getContext('2d', { willReadFrequently: Boolean(options.cvd) });
  if (!ctx) return 0;

  const spec = options.condition ? VISUAL_CONDITIONS[options.condition] : undefined;
  const scale = width / REFERENCE_WIDTH;

  // 1) CSS filter pass (blur / contrast / brightness / saturation).
  ctx.save();
  if (spec) {
    const filters: string[] = [];
    if (spec.blur) filters.push(`blur(${(spec.blur * scale).toFixed(2)}px)`);
    if (spec.contrast != null) filters.push(`contrast(${spec.contrast})`);
    if (spec.brightness != null) filters.push(`brightness(${spec.brightness})`);
    if (spec.saturate != null) filters.push(`saturate(${spec.saturate})`);
    ctx.filter = filters.length ? filters.join(' ') : 'none';
  }
  ctx.drawImage(source, 0, 0, width, height);
  ctx.restore();

  // 2) CVD color matrix pass (pixel-level).
  if (options.cvd) {
    applyCvd(ctx, width, height, options.cvd);
  }

  // 3) Overlay passes.
  if (spec?.overlays) {
    for (const overlay of spec.overlays) {
      drawOverlay(ctx, width, height, overlay, options.condition ?? 'normal');
    }
  }

  return performance.now() - start;
}

function applyCvd(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cvd: CvdType,
): void {
  const matrix = CVD_MATRICES[cvd];
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = applyMatrixToRgb(matrix, data[i]!, data[i + 1]!, data[i + 2]!);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  ctx.putImageData(image, 0, 0);
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlay: Overlay,
  seedKey: VisualConditionId,
): void {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.hypot(width, height) / 2;
  const intensity = overlay.intensity ?? 0.5;

  ctx.save();
  switch (overlay.kind) {
    case 'tint': {
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = intensity;
      ctx.fillStyle = overlay.color ?? '#C9A227';
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'vignette': {
      const clearFraction = Math.max(0.02, 1 - intensity);
      const grad = ctx.createRadialGradient(cx, cy, maxR * clearFraction * 0.6, cx, cy, maxR);
      const color = overlay.color ?? '#000000';
      grad.addColorStop(0, hexToRgba(color, 0));
      grad.addColorStop(Math.min(0.98, clearFraction), hexToRgba(color, 0));
      grad.addColorStop(1, hexToRgba(color, color === '#ffffff' ? intensity : 1));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'centralLoss': {
      const radius = maxR * 0.32;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const color = overlay.color ?? '#4b4b4b';
      grad.addColorStop(0, hexToRgba(color, intensity));
      grad.addColorStop(0.6, hexToRgba(color, intensity * 0.7));
      grad.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'spots': {
      const rand = mulberry32(hashSeed(seedKey));
      const count = overlay.count ?? 10;
      const color = overlay.color ?? '#000000';
      for (let i = 0; i < count; i++) {
        const x = rand() * width;
        const y = rand() * height;
        const r = (0.03 + rand() * 0.06) * width;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, hexToRgba(color, intensity));
        grad.addColorStop(0.7, hexToRgba(color, intensity * 0.8));
        grad.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

function hashSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
