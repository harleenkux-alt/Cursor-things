import { useEffect, useRef } from 'react';
import type { CvdType, VisualConditionId } from '@/types/experience';
import { renderVisual } from '@/simulations';

interface CanvasPreviewProps {
  image: HTMLImageElement;
  width: number;
  height: number;
  condition?: VisualConditionId;
  cvd?: CvdType;
  zoom?: number;
  onRendered?: (ms: number) => void;
}

/**
 * Renders the exported frame image onto a canvas with the selected simulation
 * applied. Rendering is memoized per (condition, cvd, size) via a cache of
 * offscreen canvases so switching filters stays well under 100ms.
 */
export function CanvasPreview({
  image,
  width,
  height,
  condition,
  cvd,
  zoom = 1,
  onRendered,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const key = `${condition ?? 'normal'}|${cvd ?? 'none'}|${width}x${height}`;

    const cached = cacheRef.current.get(key);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    if (cached) {
      ctx.drawImage(cached, 0, 0);
      onRendered?.(0);
      return;
    }

    const ms = renderVisual(image, canvas, width, height, { condition, cvd });

    // Store a copy for the cache.
    const copy = document.createElement('canvas');
    copy.width = width;
    copy.height = height;
    copy.getContext('2d')?.drawImage(canvas, 0, 0);
    cacheRef.current.set(key, copy);
    onRendered?.(ms);
  }, [image, width, height, condition, cvd, onRendered]);

  // Invalidate cache when the underlying image changes.
  useEffect(() => {
    cacheRef.current.clear();
  }, [image]);

  return (
    <canvas
      ref={canvasRef}
      className="block rounded-lg"
      style={{
        width: width * zoom,
        height: 'auto',
        maxWidth: zoom <= 1 ? '100%' : 'none',
        imageRendering: zoom > 1 ? 'pixelated' : 'auto',
      }}
    />
  );
}
