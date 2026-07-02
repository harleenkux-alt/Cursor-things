import type { Issue } from '@/types/analysis';
import { useAuditStore } from '@/store/useAuditStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

/** Renders a fix suggestion with current → recommended values and an Apply CTA. */
export function FixPanel({ issue }: { issue: Issue }) {
  const applyFix = useAuditStore((s) => s.applyFix);
  const fix = issue.fix;
  if (!fix) return null;

  const isColor = fix.kind === 'setFillColor' || fix.kind === 'setTextColor';

  return (
    <div className="mt-2.5 rounded-lg border border-dashed border-brand-200 bg-brand-50/60 p-2.5 dark:border-brand-800 dark:bg-brand-900/20">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-200">
        <Icon name="Wrench" size={13} />
        {fix.label}
      </div>

      {(fix.current || fix.recommended) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {fix.current && (
            <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 text-muted line-through dark:bg-white/[0.06]">
              {fix.current}
            </span>
          )}
          {fix.recommended && (
            <>
              <Icon name="ChevronDown" size={12} className="-rotate-90 text-muted" />
              <span className="rounded-md bg-success/10 px-1.5 py-0.5 font-medium text-success">
                {fix.recommended}
              </span>
            </>
          )}
        </div>
      )}

      {isColor && fix.suggestedValue && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span
            className="h-4 w-4 rounded-full border border-black/10"
            style={{ backgroundColor: fix.suggestedValue }}
          />
          <span className="font-mono text-muted">{fix.suggestedValue}</span>
        </div>
      )}

      {fix.description && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{fix.description}</p>
      )}

      {fix.autoFixable && (
        <Button size="sm" className="mt-2" onClick={() => applyFix(fix)}>
          <Icon name="Sparkles" size={13} />
          Apply fix
        </Button>
      )}
    </div>
  );
}
