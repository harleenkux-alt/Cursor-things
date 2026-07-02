import type { MotionExperienceResult } from '@/types/experience';
import { useAuditStore } from '@/store/useAuditStore';
import { SidePanel, RecoList } from './SidePanel';
import { SimStatusPill } from './SimStatusPill';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/common/EmptyState';

export function MotionTab({ result }: { result: MotionExperienceResult }) {
  const locate = useAuditStore((s) => s.locate);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-2.5">
        {result.items.length === 0 ? (
          <EmptyState
            icon="Waves"
            title="No risky motion detected"
            description="No parallax, flashing, looping, or large auto-transitions were found. Keep motion purposeful and honor reduce-motion preferences."
          />
        ) : (
          result.items.map((item) => (
            <div
              key={`${item.nodeId}-${item.kind}`}
              className="flex items-center gap-3 rounded-card border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40">
                <Icon name="Waves" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SimStatusPill status={item.status} />
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  <span className="text-[10px] uppercase text-muted">{item.kind}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{item.recommendation}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => locate([item.nodeId])}>
                <Icon name="Crosshair" size={13} />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <SidePanel title="Reduced-motion guidance">
          <RecoList items={result.recommendations} />
        </SidePanel>
        <SidePanel title="WCAG references" icon="Info">
          <ul className="space-y-1 text-[11px] text-muted">
            <li>2.3.1 Three Flashes — A</li>
            <li>2.2.2 Pause, Stop, Hide — A</li>
            <li>2.3.3 Animation from Interactions — AAA</li>
          </ul>
        </SidePanel>
      </div>
    </div>
  );
}
