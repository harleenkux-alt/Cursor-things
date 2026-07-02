import { useEffect, useState } from 'react';
import type { FrameImage } from '@/types/experience';

/** Create a stable object URL for the exported frame PNG, revoked on cleanup. */
export function useImageUrl(frameImage: FrameImage | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!frameImage) {
      setUrl(null);
      return;
    }
    const blob = new Blob([frameImage.bytes as BlobPart], { type: 'image/png' });
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [frameImage]);

  return url;
}
