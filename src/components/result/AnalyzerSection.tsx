import { AnimatePresence, motion } from 'framer-motion';
import type { AnalyzerResult } from '@/types/analysis';
import { useSectionExpansion } from '@/hooks/useSectionExpansion';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { StatusPill } from '@/components/ui/StatusPill';
import { scoreColor } from '@/components/ui/scoreColor';
import { cn } from '@/utils/cn';
import { IssueCard } from './IssueCard';

export function AnalyzerSection({
  result,
  highlighted = false,
}: {
  result: AnalyzerResult;
  highlighted?: boolean;
}) {
  const [expanded, toggle] = useSectionExpansion(result.analyzerId);
  const color = scoreColor(result.score);

  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow',
        highlighted && 'ring-2 ring-brand-500/50',
      )}
    >
      <button
        onClick={toggle}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
        aria-expanded={expanded}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <Icon name={result.icon} size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{result.title}</span>
            <StatusPill status={result.status} />
          </div>
          <span className="text-xs text-muted">
            {result.issues.length === 0
              ? 'No issues found'
              : `${result.issues.length} issue${result.issues.length > 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color }}>
            {result.score}
          </span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-muted">
            <Icon name="ChevronDown" size={16} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 border-t border-[var(--border)] p-3.5">
              {result.recommendations.length > 0 && (
                <div className="rounded-lg bg-brand-50/60 p-2.5 dark:bg-brand-900/20">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-200">
                    <Icon name="Lightbulb" size={13} />
                    Recommendations
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-muted">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.issues.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg bg-success/5 px-3 py-4 text-sm text-success">
                  <Icon name="CheckCircle2" size={16} />
                  Everything looks good here.
                </div>
              ) : (
                result.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
