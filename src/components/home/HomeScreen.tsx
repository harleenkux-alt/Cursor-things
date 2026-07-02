import { motion } from 'framer-motion';
import { useAuditStore } from '@/store/useAuditStore';
import { useSelection, useAuditError } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';

export function HomeScreen() {
  const selection = useSelection();
  const error = useAuditError();
  const analyze = useAuditStore((s) => s.analyze);
  const openSettings = useAuditStore((s) => s.openSettings);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2 text-brand-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Icon name="Accessibility" size={18} />
          </div>
          <span className="text-sm font-semibold tracking-tight">Inclusive Audit</span>
        </div>
        <Button variant="ghost" size="sm" onClick={openSettings} aria-label="Settings">
          <Icon name="Settings" size={16} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft-lg"
        >
          <Icon name="ScanLine" size={30} />
        </motion.div>

        <h1 className="text-3xl font-bold tracking-tight">Inclusive Audit</h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
          Analyze accessibility, usability and inclusive design of any screen.
        </p>

        <div className="mt-8 w-full max-w-xs">
          <Button
            size="lg"
            className="w-full"
            onClick={analyze}
            disabled={!selection.hasFrame}
          >
            <Icon name="Sparkles" size={18} />
            Analyze Screen
          </Button>

          <div className="mt-4">
            {selection.hasFrame ? (
              <Card className="flex items-center gap-2 px-3 py-2 text-left">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                  <Icon name="CheckCircle2" size={14} />
                </span>
                <span className="truncate text-xs text-muted">
                  Ready to analyze{' '}
                  <span className="font-medium text-[var(--text)]">
                    {selection.frameName}
                  </span>
                </span>
              </Card>
            ) : (
              <p className="text-xs font-medium text-muted">Select a frame to begin.</p>
            )}
          </div>

          {error && (
            <p className="mt-3 text-xs font-medium text-danger">{error}</p>
          )}
        </div>
      </div>

      <footer className="px-5 pb-4 text-center text-[10px] text-muted">
        WCAG 2.1 / 2.2 · Runs fully offline · No design data leaves Figma
      </footer>
    </div>
  );
}
