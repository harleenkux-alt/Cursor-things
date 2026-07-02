import type { CategoryScore } from '@/types/analysis';
import { Card } from '@/components/ui/Card';
import { scoreColor } from '@/components/ui/scoreColor';

export function CategoryGrid({ scores }: { scores: CategoryScore[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {scores.map((cs) => {
        const color = scoreColor(cs.score);
        return (
          <Card key={cs.category} className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{cs.label}</span>
              <span className="text-[10px] font-semibold" style={{ color }}>
                {cs.grade}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold" style={{ color }}>
                {cs.score}
              </span>
              <span className="text-[10px] text-muted">/100</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${cs.score}%`, backgroundColor: color }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
