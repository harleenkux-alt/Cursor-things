import type { AuditReport } from '@/types/analysis';
import { SEVERITY_META, SEVERITY_ORDER } from '@/models/severity';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Card } from '@/components/ui/Card';

export function ScoreHeader({ report }: { report: AuditReport }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <ScoreRing score={report.overallScore} size={120} label={`Grade ${report.grade}`} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Accessibility Score
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {report.stats.totalIssues === 0
              ? 'No accessibility issues detected.'
              : `${report.stats.totalIssues} issue${report.stats.totalIssues > 1 ? 's' : ''} across ${report.meta.nodeCount} layers.`}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SEVERITY_ORDER.map((sev) => {
              const count = report.stats.bySeverity[sev];
              if (!count) return null;
              const meta = SEVERITY_META[sev];
              return (
                <span
                  key={sev}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                >
                  {count} {meta.label}
                </span>
              );
            })}
          </div>

          <p className="mt-2 text-[10px] text-muted">
            Analyzed in {report.meta.analysisMs}ms · {report.meta.pageName}
          </p>
        </div>
      </div>
    </Card>
  );
}
