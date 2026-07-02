import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export function SidePanel({
  title,
  icon = 'Lightbulb',
  children,
}: {
  title: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-card border border-[var(--border)] bg-[var(--surface)] p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <Icon name={icon} size={15} className="text-brand-600" />
        {title}
      </div>
      {children}
    </div>
  );
}

export function RecoList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-xs text-muted">
          <span className="mt-0.5 shrink-0 text-brand-600">
            <Icon name="Sparkles" size={12} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
