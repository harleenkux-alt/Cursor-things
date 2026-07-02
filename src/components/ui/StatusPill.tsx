import type { AnalyzerResult } from '@/types/analysis';
import { cn } from '@/utils/cn';

const MAP: Record<AnalyzerResult['status'], { label: string; className: string }> = {
  pass: { label: 'Pass', className: 'bg-success/10 text-success' },
  warn: { label: 'Review', className: 'bg-warning/15 text-warning' },
  fail: { label: 'Issues', className: 'bg-danger/10 text-danger' },
};

export function StatusPill({
  status,
  className,
}: {
  status: AnalyzerResult['status'];
  className?: string;
}) {
  const meta = MAP[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}
