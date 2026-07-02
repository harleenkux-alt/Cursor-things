import { useMemo } from 'react';
import type {
  CvdType,
  FrameImage,
  VisualConditionId,
  VisualFilterId,
} from '@/types/experience';
import {
  CVD_LABELS,
  CVD_PREVALENCE,
  VISUAL_CONDITIONS,
  VISUAL_CONDITION_ORDER,
} from '@/simulations';
import { CanvasPreview } from './CanvasPreview';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

const CVD_TYPES: CvdType[] = [
  'protanopia',
  'protanomaly',
  'deuteranopia',
  'deuteranomaly',
  'tritanopia',
  'tritanomaly',
  'achromatopsia',
  'achromatomaly',
];

/** Fit the frame into a gallery thumbnail box while preserving aspect ratio. */
function thumbSize(frame: FrameImage, maxW: number, maxH: number) {
  const scale = Math.min(maxW / frame.width, maxH / frame.height, 1);
  return {
    width: Math.max(1, Math.round(frame.width * scale)),
    height: Math.max(1, Math.round(frame.height * scale)),
  };
}

interface GalleryItem {
  id: VisualFilterId;
  label: string;
  sub?: string;
  condition?: VisualConditionId;
  cvd?: CvdType;
}

/**
 * Renders the selected frame under every simulated impairment at once so the
 * designer can scan how the screen degrades across conditions. Each thumbnail is
 * rendered at a reduced resolution to stay responsive.
 */
export function VisualGallery({
  image,
  frameImage,
  active,
  onSelect,
}: {
  image: HTMLImageElement;
  frameImage: FrameImage;
  active: VisualFilterId;
  onSelect: (id: VisualFilterId) => void;
}) {
  const dims = useMemo(() => thumbSize(frameImage, 260, 320), [frameImage]);

  const visionItems: GalleryItem[] = VISUAL_CONDITION_ORDER.map((id) => ({
    id,
    label: VISUAL_CONDITIONS[id].label,
    condition: id,
  }));

  const cvdItems: GalleryItem[] = CVD_TYPES.map((id) => ({
    id,
    label: CVD_LABELS[id],
    sub: CVD_PREVALENCE[id],
    condition: 'normal',
    cvd: id,
  }));

  return (
    <div className="space-y-5">
      <GallerySection
        title="Vision conditions"
        items={visionItems}
        image={image}
        dims={dims}
        active={active}
        onSelect={onSelect}
      />
      <GallerySection
        title="Color vision deficiency"
        items={cvdItems}
        image={image}
        dims={dims}
        active={active}
        onSelect={onSelect}
      />
    </div>
  );
}

function GallerySection({
  title,
  items,
  image,
  dims,
  active,
  onSelect,
}: {
  title: string;
  items: GalleryItem[];
  image: HTMLImageElement;
  dims: { width: number; height: number };
  active: VisualFilterId;
  onSelect: (id: VisualFilterId) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                'group flex flex-col overflow-hidden rounded-card border bg-[var(--surface)] text-left transition-all hover:shadow-soft-lg',
                isActive
                  ? 'border-brand-500 ring-2 ring-brand-500/30'
                  : 'border-[var(--border)]',
              )}
            >
              <div className="flex items-center justify-center bg-[repeating-conic-gradient(#0000000a_0%_25%,transparent_0%_50%)] bg-[length:14px_14px] p-2">
                <CanvasPreview
                  image={image}
                  width={dims.width}
                  height={dims.height}
                  condition={item.condition}
                  cvd={item.cvd}
                />
              </div>
              <div className="flex items-center gap-1.5 border-t border-[var(--border)] px-2.5 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{item.label}</div>
                  {item.sub && (
                    <div className="truncate text-[10px] text-muted">{item.sub}</div>
                  )}
                </div>
                {isActive && (
                  <span className="text-brand-600">
                    <Icon name="CheckCircle2" size={14} />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
