import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

export function EmptyState({
  icon = 'Info',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl2 bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200">
        <Icon name={icon} size={26} />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
