import * as Tabs from '@radix-ui/react-tabs';
import { useAuditStore } from '@/store/useAuditStore';
import { useReport } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ScoreHeader } from './ScoreHeader';
import { CategoryGrid } from './CategoryGrid';
import { AnalyzerSection } from './AnalyzerSection';
import { ColorInventoryPanel } from './ColorInventoryPanel';
import { RecommendationsPanel } from './RecommendationsPanel';
import { ExportBar } from './ExportBar';

const TAB_TRIGGER =
  'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--text)] data-[state=active]:shadow-soft';

export function ResultScreen() {
  const report = useReport();
  const analyze = useAuditStore((s) => s.analyze);
  const goHome = useAuditStore((s) => s.goHome);
  const openSettings = useAuditStore((s) => s.openSettings);

  if (!report) return null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
        <Button variant="ghost" size="sm" onClick={goHome} aria-label="Back">
          <Icon name="ChevronDown" size={16} className="rotate-90" />
        </Button>
        <h2 className="mr-auto text-sm font-semibold">Audit Report</h2>
        <Button variant="ghost" size="sm" onClick={analyze} aria-label="Re-analyze">
          <Icon name="ScanLine" size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={openSettings} aria-label="Settings">
          <Icon name="Settings" size={16} />
        </Button>
      </header>

      <Tabs.Root defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
        <Tabs.List className="mx-4 mt-3 flex gap-1 rounded-xl bg-[var(--border)]/50 p-1">
          <Tabs.Trigger value="overview" className={TAB_TRIGGER}>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="sections" className={TAB_TRIGGER}>
            Sections
          </Tabs.Trigger>
          <Tabs.Trigger value="colors" className={TAB_TRIGGER}>
            Colors
          </Tabs.Trigger>
        </Tabs.List>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
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

          <Tabs.Content value="colors" className="focus-visible:outline-none">
            <ColorInventoryPanel inventory={report.colorInventory} />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <ExportBar report={report} />
    </div>
  );
}
