import { useState } from 'react';
import type { FrameImage, KeyboardResult } from '@/types/experience';
import { useAuditStore } from '@/store/useAuditStore';
import { useImageUrl } from './useImageUrl';
import { HighlightImage } from './HighlightImage';
import { SidePanel } from './SidePanel';
import { SimStatusPill } from './SimStatusPill';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function KeyboardTab({
  frameImage,
  result,
}: {
  frameImage: FrameImage;
  result: KeyboardResult;
}) {
  const url = useImageUrl(frameImage);
  const locate = useAuditStore((s) => s.locate);
  const [index, setIndex] = useState(0);
  const stops = result.stops;

  const go = (next: number) => {
    if (stops.length === 0) return;
    const i = (next + stops.length) % stops.length;
    setIndex(i);
    const stop = stops[i];
    if (stop) locate([stop.nodeId]);
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => go(index - 1)}>
            <Icon name="ChevronDown" size={14} className="rotate-90" />
            Prev focus
          </Button>
          <Button variant="secondary" size="sm" onClick={() => go(index + 1)}>
            Next focus
            <Icon name="ChevronDown" size={14} className="-rotate-90" />
          </Button>
          <span className="ml-auto text-xs text-muted">
            {stops.length ? `Tab stop ${index + 1} of ${stops.length}` : 'No focusable elements'}
          </span>
        </div>

        <div className="max-h-[420px] overflow-auto rounded-lg">
          {url && (
            <HighlightImage
              url={url}
              items={stops.map((s, i) => ({
                bounds: s.bounds,
                order: s.order,
                active: i === index,
                status: s.problems.length ? 'warn' : 'ok',
              }))}
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <SidePanel title="Focus order" icon="MousePointerClick">
          <p className="mb-2 text-[11px] text-muted">
            Derived top-to-bottom, left-to-right. Confirm the implemented DOM order matches.
          </p>
          <div className="max-h-[260px] space-y-0.5 overflow-auto">
            {stops.map((s, i) => (
              <button
                key={s.nodeId}
                onClick={() => go(i)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[11px] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
              >
                <span className="w-4 shrink-0 text-muted">{s.order}</span>
                <span className="shrink-0 rounded bg-black/[0.05] px-1 text-[9px] uppercase text-muted dark:bg-white/[0.08]">
                  {s.role}
                </span>
                <span className="truncate">{s.name}</span>
                {s.problems.length > 0 && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                )}
              </button>
            ))}
          </div>
        </SidePanel>

        {result.issues.length > 0 && (
          <SidePanel title="Keyboard issues" icon="AlertTriangle">
            <div className="space-y-2">
              {result.issues.map((issue) => (
                <div key={issue.id} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <SimStatusPill status={issue.status} />
                    <span className="font-medium">{issue.title}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">{issue.description}</p>
                  {issue.wcag && (
                    <span className="mt-1 inline-block text-[10px] text-brand-600">
                      WCAG {issue.wcag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </SidePanel>
        )}
      </div>
    </div>
  );
}
