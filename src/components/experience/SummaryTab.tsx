import type { ExperienceReport } from '@/types/experience';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Card } from '@/components/ui/Card';
import { RadarChart } from './RadarChart';
import { SidePanel, RecoList } from './SidePanel';
import { scoreColor } from '@/components/ui/scoreColor';

export function SummaryTab({ report }: { report: ExperienceReport }) {
  const { summary } = report;
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-3">
        <Card className="flex items-center gap-4 p-4">
          <ScoreRing score={summary.score} size={110} label="Experience" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Accessibility Experience Score
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {summary.issueCount} potential issue(s) across {report.meta.nodeCount} layers.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {summary.categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted">{c.label}</span>
                  <span className="font-semibold" style={{ color: scoreColor(c.score) }}>
                    {c.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="mb-1 text-xs font-semibold text-muted">Experience radar</div>
          <RadarChart categories={summary.categories} />
        </Card>
      </div>

      <div className="space-y-3">
        <SidePanel title="Top recommendations">
          <RecoList items={summary.recommendations} />
        </SidePanel>
      </div>
    </div>
  );
}
