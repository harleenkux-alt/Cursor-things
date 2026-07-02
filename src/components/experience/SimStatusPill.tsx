import type { SimStatus } from '@/types/experience';
import { cn } from '@/utils/cn';

const MAP: Record<SimStatus, { label: string; className: string; dot: string }> = {
  pass: { label: 'Pass', className: 'bg-success/10 text-success', dot: '#16A34A' },
  warning: { label: 'Warning', className: 'bg-warning/15 text-warning', dot: '#F59E0B' },
  fail: { label: 'Fail', className: 'bg-danger/10 text-danger', dot: '#DC2626' },
};

export function SimStatusPill({
  status,
  className,
}: {
  status: SimStatus;
  className?: string;
}) {
  const meta = MAP[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        meta.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      {meta.label}
    </span>
  );
}
