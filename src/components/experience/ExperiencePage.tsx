import * as Tabs from '@radix-ui/react-tabs';
import { useAuditStore } from '@/store/useAuditStore';
import { useExperience, useFrameImage } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/common/EmptyState';
import { Disclaimer } from './Disclaimer';
import { VisualTab } from './VisualTab';
import { MotorTab } from './MotorTab';
import { HearingTab } from './HearingTab';
import { ScreenReaderTab } from './ScreenReaderTab';
import { KeyboardTab } from './KeyboardTab';
import { CognitiveTab } from './CognitiveTab';
import { MotionTab } from './MotionTab';
import { SummaryTab } from './SummaryTab';

const TABS = [
  { id: 'visual', label: 'Visual' },
  { id: 'motor', label: 'Motor' },
  { id: 'hearing', label: 'Hearing' },
  { id: 'screenReader', label: 'Screen Reader' },
  { id: 'keyboard', label: 'Keyboard' },
  { id: 'cognitive', label: 'Cognitive' },
  { id: 'motion', label: 'Motion' },
  { id: 'summary', label: 'Summary' },
];

const TAB_TRIGGER =
  'whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition-colors data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--text)] data-[state=active]:shadow-soft';

export function ExperiencePage() {
  const experience = useExperience();
  const frameImage = useFrameImage();
  const runSimulation = useAuditStore((s) => s.runSimulation);

  if (!experience || !frameImage) {
    return (
      <EmptyState
        icon="Eye"
        title="Experience Accessibility"
        description="Select a frame and run the simulation to preview how users with different accessibility needs may experience this design."
        action={
          <Button size="sm" onClick={runSimulation}>
            <Icon name="Sparkles" size={14} />
            Run Accessibility Simulation
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-2.5">
        <h2 className="mr-auto text-sm font-semibold">Experience Accessibility</h2>
        <Button variant="secondary" size="sm" onClick={runSimulation}>
          <Icon name="ScanLine" size={14} />
          Re-run
        </Button>
      </header>

      <Tabs.Root defaultValue="visual" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-[var(--border)] px-4 pt-3">
          <Tabs.List className="flex gap-1 overflow-x-auto pb-2">
            {TABS.map((t) => (
              <Tabs.Trigger key={t.id} value={t.id} className={TAB_TRIGGER}>
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-3">
            <Disclaimer />
          </div>

          <Tabs.Content value="visual" className="focus-visible:outline-none">
            <VisualTab frameImage={frameImage} color={experience.color} />
          </Tabs.Content>
          <Tabs.Content value="motor" className="focus-visible:outline-none">
            <MotorTab result={experience.motor} />
          </Tabs.Content>
          <Tabs.Content value="hearing" className="focus-visible:outline-none">
            <HearingTab result={experience.hearing} />
          </Tabs.Content>
          <Tabs.Content value="screenReader" className="focus-visible:outline-none">
            <ScreenReaderTab frameImage={frameImage} result={experience.screenReader} />
          </Tabs.Content>
          <Tabs.Content value="keyboard" className="focus-visible:outline-none">
            <KeyboardTab frameImage={frameImage} result={experience.keyboard} />
          </Tabs.Content>
          <Tabs.Content value="cognitive" className="focus-visible:outline-none">
            <CognitiveTab result={experience.cognitive} />
          </Tabs.Content>
          <Tabs.Content value="motion" className="focus-visible:outline-none">
            <MotionTab result={experience.motion} />
          </Tabs.Content>
          <Tabs.Content value="summary" className="focus-visible:outline-none">
            <SummaryTab report={experience} />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
