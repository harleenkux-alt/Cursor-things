import { motion } from 'framer-motion';
import { useAuditStore } from '@/store/useAuditStore';
import { useSelection, useReport, useExperience, useAuditError } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { scoreColor } from '@/components/ui/scoreColor';

export function DashboardScreen() {
  const selection = useSelection();
  const report = useReport();
  const experience = useExperience();
  const error = useAuditError();
  const analyze = useAuditStore((s) => s.analyze);
  const runSimulation = useAuditStore((s) => s.runSimulation);
  const setNav = useAuditStore((s) => s.setNav);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft-lg">
            <Icon name="Accessibility" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inclusive Audit</h1>
            <p className="text-sm text-muted">
              Analyze accessibility, usability and inclusive design of any screen.
            </p>
          </div>
        </motion.div>

        <div className="mt-4 rounded-card border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs">
          {selection.hasFrame ? (
            <span className="flex items-center gap-2 text-muted">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-success/10 text-success">
                <Icon name="CheckCircle2" size={12} />
              </span>
              Selected frame:{' '}
              <span className="font-medium text-[var(--text)]">{selection.frameName}</span>
            </span>
          ) : (
            <span className="font-medium text-muted">Select a frame to begin.</span>
          )}
        </div>
        {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ActionCard
            icon="ScanLine"
            title="Accessibility Audit"
            desc="Run 11 analyzers across contrast, typography, components, and more."
            cta="Analyze Screen"
            onClick={analyze}
            disabled={!selection.hasFrame}
          />
          <ActionCard
            icon="Eye"
            title="Experience Accessibility"
            desc="Preview how users with different needs may experience this design."
            cta="Run Accessibility Simulation"
            onClick={runSimulation}
            disabled={!selection.hasFrame}
            accent
          />
        </div>

        {(report || experience) && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Latest results
            </p>
            <div className="grid grid-cols-2 gap-3">
              {report && (
                <ScoreCard
                  label="Audit Score"
                  score={report.overallScore}
                  sub={`Grade ${report.grade} · ${report.stats.totalIssues} issues`}
                  onClick={() => setNav('audit')}
                />
              )}
              {experience && (
                <ScoreCard
                  label="Experience Score"
                  score={experience.summary.score}
                  sub={`${experience.summary.issueCount} potential issues`}
                  onClick={() => setNav('experience')}
                />
              )}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-[10px] text-muted">
          Runs fully offline · No design data leaves Figma
        </p>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  desc,
  cta,
  onClick,
  disabled,
  accent,
}: {
  icon: string;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-col p-4">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? 'bg-accent/15 text-accent' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200'
        }`}
      >
        <Icon name={icon} size={20} />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{desc}</p>
      <Button
        size="sm"
        className="mt-3 w-full"
        variant={accent ? 'primary' : 'secondary'}
        onClick={onClick}
        disabled={disabled}
      >
        {cta}
      </Button>
    </Card>
  );
}

function ScoreCard({
  label,
  score,
  sub,
  onClick,
}: {
  label: string;
  score: number;
  sub: string;
  onClick: () => void;
}) {
  const color = scoreColor(score);
  return (
    <Card
      className="cursor-pointer p-3 transition-shadow hover:shadow-soft-lg"
      onClick={onClick}
    >
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ color }}>
        {score}
      </div>
      <div className="mt-1 text-[11px] text-muted">{sub}</div>
    </Card>
  );
}
