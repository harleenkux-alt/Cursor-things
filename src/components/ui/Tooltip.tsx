import type { ReactNode } from 'react';
import * as RTooltip from '@radix-ui/react-tooltip';

export function Tooltip({
  children,
  label,
}: {
  children: ReactNode;
  label: ReactNode;
}) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          sideOffset={6}
          className="z-50 max-w-[220px] rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-soft-lg animate-fade-in"
        >
          {label}
          <RTooltip.Arrow className="fill-slate-900" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
