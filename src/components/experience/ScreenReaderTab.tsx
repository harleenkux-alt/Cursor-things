import { useState } from 'react';
import type { FrameImage, ScreenReaderResult } from '@/types/experience';
import { useAuditStore } from '@/store/useAuditStore';
import { useImageUrl } from './useImageUrl';
import { HighlightImage } from './HighlightImage';
import { SidePanel } from './SidePanel';
import { SimStatusPill } from './SimStatusPill';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

export function ScreenReaderTab({
  frameImage,
  result,
}: {
  frameImage: FrameImage;
  result: ScreenReaderResult;
}) {
  const url = useImageUrl(frameImage);
  const locate = useAuditStore((s) => s.locate);
  const [index, setIndex] = useState(0);
  const items = result.items;
  const current = items[index];

  const go = (next: number) => {
    if (items.length === 0) return;
    const i = (next + items.length) % items.length;
    setIndex(i);
    const item = items[i];
    if (item) locate([item.nodeId]);
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => go(index - 1)}>
            <Icon name="ChevronDown" size={14} className="rotate-90" />
            Previous
          </Button>
          <Button variant="secondary" size="sm" onClick={() => go(index + 1)}>
            Next
            <Icon name="ChevronDown" size={14} className="-rotate-90" />
          </Button>
          <span className="ml-auto text-xs text-muted">
            {items.length ? `${index + 1} of ${items.length}` : 'No elements'}
          </span>
        </div>

        <div className="max-h-[420px] overflow-auto rounded-lg">
          {url && (
            <HighlightImage
              url={url}
              items={items.map((it, i) => ({
                bounds: it.bounds,
                order: it.order,
                active: i === index,
                status: it.problems.length ? 'warn' : 'ok',
              }))}
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <SidePanel title="Current element" icon="Eye">
          {current ? (
            <div className="space-y-2 text-xs">
              <Detail label="Reading order" value={`#${current.order}`} />
              <Detail label="Role" value={current.role} />
              <Detail label="Accessible name" value={current.accessibleName || '—'} />
              {current.text && <Detail label="Text" value={current.text} />}
              {current.problems.length > 0 ? (
                <div className="rounded-md bg-warning/10 p-2 text-[11px] text-warning">
                  {current.problems.map((p, i) => (
                    <div key={i}>• {p}</div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-success">
                  <Icon name="CheckCircle2" size={12} /> No issues detected
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted">No readable elements found.</p>
          )}
        </SidePanel>

        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-2">
          <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Reading order
          </div>
          <div className="max-h-[220px] space-y-0.5 overflow-auto">
            {items.map((it, i) => (
              <button
                key={it.nodeId}
                onClick={() => go(i)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[11px] transition-colors',
                  i === index
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05]',
                )}
              >
                <span className="w-4 shrink-0 text-muted">{it.order}</span>
                <span className="shrink-0 rounded bg-black/[0.05] px-1 text-[9px] uppercase text-muted dark:bg-white/[0.08]">
                  {it.role}
                </span>
                <span className="truncate">{it.accessibleName}</span>
                {it.problems.length > 0 && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                )}
              </button>
            ))}
          </div>
        </div>

        {result.problems.length > 0 && (
          <SidePanel title="Problems" icon="AlertTriangle">
            <div className="space-y-2">
              {result.problems.map((p) => (
                <div key={p.id} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <SimStatusPill status={p.status} />
                    <span className="font-medium">{p.title}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">{p.description}</p>
                </div>
              ))}
            </div>
          </SidePanel>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
