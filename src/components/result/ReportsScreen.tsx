import { useAuditStore } from '@/store/useAuditStore';
import { useReport } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ScoreHeader } from './ScoreHeader';
import { CategoryGrid } from './CategoryGrid';
import { RecommendationsPanel } from './RecommendationsPanel';
import { ExportBar } from './ExportBar';

export function ReportsScreen() {
  const report = useReport();
  const analyze = useAuditStore((s) => s.analyze);

  if (!report) {
    return (
      <EmptyState
        icon="FileText"
        title="No report yet"
        description="Run an accessibility audit to generate a shareable report you can export as PDF, JSON, or CSV."
        action={
          <Button size="sm" onClick={analyze}>
            Analyze Screen
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-3 p-5">
          <h2 className="text-lg font-semibold">Accessibility Report</h2>
          <ScoreHeader report={report} />
          <CategoryGrid scores={report.categoryScores} />
          <RecommendationsPanel report={report} />
        </div>
      </div>
      <ExportBar report={report} />
    </div>
  );
}
