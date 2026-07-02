import type { MotorResult } from '@/types/experience';
import { useAuditStore } from '@/store/useAuditStore';
import { SidePanel, RecoList } from './SidePanel';
import { SimStatusPill } from './SimStatusPill';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function MotorTab({ result }: { result: MotorResult }) {
  const locate = useAuditStore((s) => s.locate);
  const problem = result.targets.filter((t) => t.status !== 'pass');

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-2.5">
        <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="text-xs text-muted">
            {result.targets.length} interactive target(s) · {problem.length} need attention
          </div>
        </div>

        {problem.length === 0 ? (
          <div className="flex items-center gap-2 rounded-card border border-[var(--border)] bg-success/5 px-3 py-4 text-sm text-success">
            <Icon name="CheckCircle2" size={16} />
            All detected touch targets meet the minimum size.
          </div>
        ) : (
          problem.map((t) => (
            <div
              key={t.nodeId}
              className="flex items-center gap-3 rounded-card border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SimStatusPill status={t.status} />
                  <span className="truncate text-sm font-medium">{t.name}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  {t.width}×{t.height}px — {t.reason}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => locate([t.nodeId])}>
                <Icon name="Crosshair" size={13} />
                Locate
              </Button>
            </div>
          ))
        )}

        {result.gestureIssues.map((g) => (
          <div
            key={g.id}
            className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-3"
          >
            <div className="flex items-center gap-2">
              <SimStatusPill status={g.status} />
              <span className="text-sm font-medium">{g.title}</span>
              {g.nodeIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => locate(g.nodeIds)}
                >
                  <Icon name="Crosshair" size={13} />
                </Button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">{g.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <SidePanel title="Recommendations">
          <RecoList items={result.recommendations} />
        </SidePanel>
        <SidePanel title="WCAG references" icon="Info">
          <ul className="space-y-1 text-[11px] text-muted">
            <li>2.5.8 Target Size (Minimum) — AA</li>
            <li>2.5.1 Pointer Gestures — A</li>
            <li>2.5.7 Dragging Movements — AA</li>
          </ul>
        </SidePanel>
      </div>
    </div>
  );
}
