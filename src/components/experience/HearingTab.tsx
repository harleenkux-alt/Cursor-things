import type { HearingResult } from '@/types/experience';
import { useAuditStore } from '@/store/useAuditStore';
import { SidePanel, RecoList } from './SidePanel';
import { SimStatusPill } from './SimStatusPill';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/common/EmptyState';

const KIND_ICON: Record<string, string> = {
  video: 'FileText',
  audio: 'Waves',
  notification: 'Info',
};

export function HearingTab({ result }: { result: HearingResult }) {
  const locate = useAuditStore((s) => s.locate);

  if (result.media.length === 0) {
    return (
      <EmptyState
        icon="Waves"
        title="No media detected"
        description="No videos, audio, or notification elements were found. If this screen has media, ensure captions, transcripts, and visual feedback are provided."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-2.5">
        {result.media.map((m) => (
          <div
            key={m.nodeId}
            className="flex items-center gap-3 rounded-card border border-[var(--border)] bg-[var(--surface)] p-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40">
              <Icon name={KIND_ICON[m.kind] ?? 'Info'} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SimStatusPill status={m.status} />
                <span className="truncate text-sm font-medium">{m.name}</span>
                <span className="text-[10px] uppercase text-muted">{m.kind}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{m.recommendation}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => locate([m.nodeId])}>
              <Icon name="Crosshair" size={13} />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <SidePanel title="Recommendations">
          <RecoList items={result.recommendations} />
        </SidePanel>
        <SidePanel title="WCAG references" icon="Info">
          <ul className="space-y-1 text-[11px] text-muted">
            <li>1.2.1 Audio-only and Video-only — A</li>
            <li>1.2.2 Captions (Prerecorded) — A</li>
            <li>1.4.2 Audio Control — A</li>
          </ul>
        </SidePanel>
      </div>
    </div>
  );
}
