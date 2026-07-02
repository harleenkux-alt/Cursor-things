import { useAuditStore, type Nav } from '@/store/useAuditStore';
import { useNav } from '@/hooks/useAudit';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/cn';

interface NavItem {
  id: Nav;
  label: string;
  icon: string;
}

const ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'audit', label: 'Accessibility Audit', icon: 'ScanLine' },
  { id: 'experience', label: 'Experience Accessibility', icon: 'Eye' },
  { id: 'colors', label: 'Color Inventory', icon: 'Palette' },
  { id: 'reports', label: 'Reports', icon: 'FileText' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

export function NavRail() {
  const nav = useNav();
  const setNav = useAuditStore((s) => s.setNav);

  return (
    <nav className="flex w-[60px] shrink-0 flex-col items-center gap-1 border-r border-[var(--border)] bg-[var(--surface)] py-3">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft">
        <Icon name="Accessibility" size={18} />
      </div>
      {ITEMS.map((item) => {
        const active = nav === item.id;
        return (
          <Tooltip key={item.id} label={item.label}>
            <button
              onClick={() => setNav(item.id)}
              aria-label={item.label}
              aria-current={active}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                active
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-200'
                  : 'text-muted hover:bg-black/[0.04] hover:text-[var(--text)] dark:hover:bg-white/[0.05]',
              )}
            >
              {active && (
                <span className="absolute left-0 h-5 w-1 -translate-x-[13px] rounded-full bg-brand-600" />
              )}
              <Icon name={item.icon} size={19} />
            </button>
          </Tooltip>
        );
      })}
    </nav>
  );
}
