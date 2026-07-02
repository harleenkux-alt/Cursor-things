import type { CognitiveExperienceResult, CognitiveRating } from '@/types/experience';
import { SidePanel, RecoList } from './SidePanel';
import { cn } from '@/utils/cn';

const RATING_META: Record<CognitiveRating, { label: string; className: string }> = {
  excellent: { label: 'Excellent', className: 'bg-success/10 text-success' },
  good: { label: 'Good', className: 'bg-accent/15 text-accent' },
  needsImprovement: { label: 'Needs Work', className: 'bg-warning/15 text-warning' },
  critical: { label: 'Critical', className: 'bg-danger/10 text-danger' },
};

export function CognitiveTab({ result }: { result: CognitiveExperienceResult }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {result.metrics.map((m) => {
            const meta = RATING_META[m.rating];
            return (
              <div
                key={m.id}
                className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-3"
              >
                <div className="text-[11px] font-medium text-muted">{m.label}</div>
                <div className="mt-1 text-lg font-bold">{m.value}</div>
                <span
                  className={cn(
                    'mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    meta.className,
                  )}
                >
                  {meta.label}
                </span>
                <p className="mt-1.5 text-[10px] leading-snug text-muted">{m.hint}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <SidePanel title="How to simplify">
          <RecoList items={result.recommendations} />
        </SidePanel>
        <SidePanel title="Note" icon="Info">
          <p className="text-[11px] leading-relaxed text-muted">
            This is a heuristic analysis of cognitive demand — not a simulation of a
            disability. Use it to reduce unnecessary complexity for everyone.
          </p>
        </SidePanel>
      </div>
    </div>
  );
}
