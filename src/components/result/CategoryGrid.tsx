import type { AnalysisCategory, CategoryScore, Issue } from '@/types/analysis';
import type { Severity } from '@/models/severity';
import { SEVERITY_META, SEVERITY_ORDER } from '@/models/severity';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { scoreColor } from '@/components/ui/scoreColor';
import { cn } from '@/utils/cn';

/** Worst (most severe) issue severity per category, for the count dot color. */
function worstByCategory(issues: Issue[]): Partial<Record<AnalysisCategory, Severity>> {
  const map: Partial<Record<AnalysisCategory, Severity>> = {};
  for (const issue of issues) {
    const current = map[issue.category];
    if (!current || SEVERITY_ORDER.indexOf(issue.severity) < SEVERITY_ORDER.indexOf(current)) {
      map[issue.category] = issue.severity;
    }
  }
  return map;
}

export function CategoryGrid({
  scores,
  issues = [],
  onSelect,
}: {
  scores: CategoryScore[];
  issues?: Issue[];
  onSelect?: (category: AnalysisCategory) => void;
}) {
  const worst = worstByCategory(issues);

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {scores.map((cs) => {
        const color = scoreColor(cs.score);
        const worstSev = worst[cs.category];
        const clickable = Boolean(onSelect);
        return (
          <Card
            key={cs.category}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onSelect?.(cs.category) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect?.(cs.category);
                    }
                  }
                : undefined
            }
            className={cn(
              'group p-3 transition-all',
              clickable &&
                'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{cs.label}</span>
              <span className="text-[10px] font-semibold" style={{ color }}>
                {cs.grade}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold" style={{ color }}>
                {cs.score}
              </span>
              <span className="text-[10px] text-muted">/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${cs.score}%`, backgroundColor: color }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between">
              {cs.issueCount > 0 ? (
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: worstSev ? SEVERITY_META[worstSev].color : '#94a3b8',
                    }}
                  />
                  <span style={{ color: worstSev ? SEVERITY_META[worstSev].color : undefined }}>
                    {cs.issueCount} issue{cs.issueCount > 1 ? 's' : ''}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                  <Icon name="CheckCircle2" size={12} />
                  No issues
                </span>
              )}

              {clickable && (
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Details
                  <Icon name="ChevronDown" size={12} className="-rotate-90" />
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
