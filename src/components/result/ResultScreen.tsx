import * as Tabs from '@radix-ui/react-tabs';
import { useAuditStore } from '@/store/useAuditStore';
import { useReport } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { ScoreHeader } from './ScoreHeader';
import { CategoryGrid } from './CategoryGrid';
import { AnalyzerSection } from './AnalyzerSection';
import { RecommendationsPanel } from './RecommendationsPanel';

const TAB_TRIGGER =
  'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--text)] data-[state=active]:shadow-soft';

export function ResultScreen() {
  const report = useReport();
  const analyze = useAuditStore((s) => s.analyze);

  if (!report) {
    return (
      <EmptyState
        icon="ScanLine"
        title="Ready to audit"
        description="Select a frame and run the accessibility audit to see scores, issues, and fixes."
        action={
          <Button size="sm" onClick={analyze}>
            Analyze Screen
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-2.5">
        <h2 className="mr-auto text-sm font-semibold">Accessibility Audit</h2>
        <Button variant="secondary" size="sm" onClick={analyze}>
          <Icon name="ScanLine" size={14} />
          Re-analyze
        </Button>
      </header>

      <Tabs.Root defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
        <Tabs.List className="mx-auto mt-3 flex w-full max-w-2xl gap-1 rounded-xl bg-[var(--border)]/50 p-1">
          <Tabs.Trigger value="overview" className={TAB_TRIGGER}>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="sections" className={TAB_TRIGGER}>
            Sections
          </Tabs.Trigger>
        </Tabs.List>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-2xl">
            <Tabs.Content value="overview" className="space-y-3 focus-visible:outline-none">
              <ScoreHeader report={report} />
              <CategoryGrid scores={report.categoryScores} />
              <RecommendationsPanel report={report} />
            </Tabs.Content>

            <Tabs.Content value="sections" className="space-y-2.5 focus-visible:outline-none">
              {report.results.map((result) => (
                <AnalyzerSection key={result.analyzerId} result={result} />
              ))}
            </Tabs.Content>
          </div>
        </div>
      </Tabs.Root>
    </div>
  );
}
