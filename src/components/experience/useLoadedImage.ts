import { useEffect, useState } from 'react';
import type { FrameImage } from '@/types/experience';
import { loadImageFromBytes } from '@/simulations';

/** Decode the exported frame PNG bytes into an <img> element once. */
export function useLoadedImage(frameImage: FrameImage | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!frameImage) {
      setImg(null);
      return;
    }
    loadImageFromBytes(frameImage.bytes)
      .then((loaded) => {
        if (!cancelled) setImg(loaded);
      })
      .catch(() => {
        if (!cancelled) setImg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [frameImage]);

  return img;
}
