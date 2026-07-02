import { useMemo, useState } from 'react';
import type { ColorEntry, ColorInventory, ColorRole } from '@/types/analysis';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

const ROLE_ORDER: ColorRole[] = [
  'primary',
  'secondary',
  'semantic',
  'neutral',
  'text',
  'background',
  'surface',
  'border',
];

const ROLE_LABELS: Record<ColorRole, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  neutral: 'Neutral',
  semantic: 'Semantic',
  background: 'Background',
  surface: 'Surface',
  border: 'Border',
  text: 'Text',
};

const RATING_STYLE: Record<ColorEntry['rating'], string> = {
  AAA: 'bg-success/10 text-success',
  AA: 'bg-success/10 text-success',
  'AA Large': 'bg-warning/15 text-warning',
  Fail: 'bg-danger/10 text-danger',
};

function Swatch({ entry }: { entry: ColorEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2.5">
      <button className="flex w-full items-center gap-2.5 text-left" onClick={() => setOpen((v) => !v)}>
        <span
          className="h-9 w-9 shrink-0 rounded-lg border border-black/10 shadow-inner"
          style={{ backgroundColor: entry.hex }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold uppercase">{entry.hex}</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[9px] font-bold',
                RATING_STYLE[entry.rating],
              )}
            >
              {entry.rating}
            </span>
          </div>
          <span className="text-[10px] text-muted">
            {entry.token} · used {entry.usageCount}×
          </span>
        </div>
        <Icon
          name="ChevronDown"
          size={14}
          className={cn('text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-2.5 space-y-1.5 border-t border-[var(--border)] pt-2.5 text-[11px]">
          <div className="flex justify-between text-muted">
            <span>RGB</span>
            <span className="font-mono">
              {entry.rgb.r}, {entry.rgb.g}, {entry.rgb.b}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">On white</span>
            <span className="flex items-center gap-1">
              <span className="rounded bg-white px-1 font-mono text-slate-900 ring-1 ring-black/10">
                Aa
              </span>
              <span className="font-mono">{entry.contrastWithWhite}:1</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">On black</span>
            <span className="flex items-center gap-1">
              <span className="rounded bg-black px-1 font-mono text-white">Aa</span>
              <span className="font-mono">{entry.contrastWithBlack}:1</span>
            </span>
          </div>
          {entry.neighbors.length > 0 && (
            <div>
              <span className="text-muted">Nearest contrasts</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {entry.neighbors.map((n) => (
                  <span
                    key={n.hex}
                    className="flex items-center gap-1 rounded-md bg-black/[0.04] px-1.5 py-0.5 font-mono dark:bg-white/[0.06]"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: n.hex }}
                    />
                    {n.ratio}:1
                  </span>
                ))}
              </div>
            </div>
          )}
          {entry.suggestedReplacement && (
            <div className="flex items-center justify-between rounded-md bg-success/5 px-1.5 py-1">
              <span className="text-muted">Suggested</span>
              <span className="flex items-center gap-1 font-mono text-success">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.suggestedReplacement }}
                />
                {entry.suggestedReplacement}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ColorInventoryPanel({ inventory }: { inventory: ColorInventory }) {
  const grouped = useMemo(() => {
    const map = new Map<ColorRole, ColorEntry[]>();
    for (const entry of inventory.entries) {
      const list = map.get(entry.role) ?? [];
      list.push(entry);
      map.set(entry.role, list);
    }
    return map;
  }, [inventory]);

  if (inventory.entries.length === 0) {
    return (
      <Card className="p-4 text-center text-sm text-muted">No solid colors detected.</Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40">
            <Icon name="Palette" size={16} />
          </span>
          <div>
            <div className="text-sm font-semibold">Color Inventory</div>
            <div className="text-[11px] text-muted">
              {inventory.totalColors} colors · {inventory.duplicateGroups.length} near-duplicate
              group(s)
            </div>
          </div>
        </div>
      </Card>

      {ROLE_ORDER.filter((role) => grouped.has(role)).map((role) => (
        <div key={role}>
          <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {ROLE_LABELS[role]}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {grouped.get(role)!.map((entry) => (
              <Swatch key={entry.hex} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
