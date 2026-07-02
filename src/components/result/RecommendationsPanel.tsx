import { useMemo } from 'react';
import type { AuditReport } from '@/types/analysis';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

/** Aggregated, de-duplicated recommendations across all analyzers. */
export function RecommendationsPanel({ report }: { report: AuditReport }) {
  const recs = useMemo(
    () => Array.from(new Set(report.results.flatMap((r) => r.recommendations))),
    [report],
  );

  if (recs.length === 0) return null;

  return (
    <Card className="p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <Icon name="Lightbulb" size={15} className="text-warning" />
        Top Recommendations
      </div>
      <ul className="space-y-1.5">
        {recs.map((rec, i) => (
          <li key={i} className="flex gap-2 text-xs text-muted">
            <span className="mt-0.5 text-brand-600">
              <Icon name="Sparkles" size={12} />
            </span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
