import type { Issue } from '@/types/analysis';
import { useAuditStore } from '@/store/useAuditStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { FixPanel } from './FixPanel';

export function IssueCard({ issue }: { issue: Issue }) {
  const locate = useAuditStore((s) => s.locate);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            {issue.wcag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                WCAG {issue.wcagLevel ? `${issue.wcagLevel} · ` : ''}
                {issue.wcag}
              </span>
            )}
          </div>
          <h4 className="mt-1.5 text-sm font-semibold leading-snug">{issue.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted">{issue.description}</p>
        </div>
      </div>

      {issue.affectedLayerNames.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
            Layers
          </span>
          {issue.affectedLayerNames.slice(0, 3).map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="max-w-[120px] truncate rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[10px] text-[var(--text)] dark:bg-white/[0.06]"
            >
              {name}
            </span>
          ))}
          {issue.affectedLayerNames.length > 3 && (
            <span className="text-[10px] text-muted">
              +{issue.affectedLayerNames.length - 3} more
            </span>
          )}
        </div>
      )}

      {issue.fix && <FixPanel issue={issue} />}

      {issue.affectedNodeIds.length > 0 && (
        <div className="mt-2.5 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => locate(issue.affectedNodeIds)}
          >
            <Icon name="Crosshair" size={14} />
            Locate
          </Button>
        </div>
      )}
    </div>
  );
}
