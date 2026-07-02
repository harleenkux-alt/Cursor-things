import { useAuditStore } from '@/store/useAuditStore';
import { useSettings } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import type { ReactNode } from 'react';

function Row({
  title,
  desc,
  control,
}: {
  title: string;
  desc: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export function SettingsScreen() {
  const settings = useSettings();
  const update = useAuditStore((s) => s.updateSettings);
  const close = useAuditStore((s) => s.closeSettings);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
        <Button variant="ghost" size="sm" onClick={close} aria-label="Back">
          <Icon name="ChevronDown" size={16} className="rotate-90" />
        </Button>
        <h2 className="text-sm font-semibold">Settings</h2>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Conformance
          </p>
          <Card className="divide-y divide-[var(--border)]">
            <Row
              title="WCAG version"
              desc="Success criteria version to test against"
              control={
                <Select
                  ariaLabel="WCAG version"
                  value={settings.wcagVersion}
                  onValueChange={(v) => update({ wcagVersion: v as '2.1' | '2.2' })}
                  options={[
                    { value: '2.1', label: 'WCAG 2.1' },
                    { value: '2.2', label: 'WCAG 2.2' },
                  ]}
                />
              }
            />
            <Row
              title="Target level"
              desc="Minimum conformance level"
              control={
                <Select
                  ariaLabel="Conformance target"
                  value={settings.conformanceTarget}
                  onValueChange={(v) => update({ conformanceTarget: v as 'AA' | 'AAA' })}
                  options={[
                    { value: 'AA', label: 'Level AA' },
                    { value: 'AAA', label: 'Level AAA' },
                  ]}
                />
              }
            />
          </Card>
        </div>

        <div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Thresholds
          </p>
          <Card className="divide-y divide-[var(--border)]">
            <Row
              title="Minimum font size"
              desc={`${settings.minFontSize}px`}
              control={
                <Slider
                  ariaLabel="Minimum font size"
                  value={settings.minFontSize}
                  min={8}
                  max={20}
                  onValueChange={(v) => update({ minFontSize: v })}
                />
              }
            />
            <Row
              title="Minimum touch target"
              desc={`${settings.minTouchTarget}px`}
              control={
                <Slider
                  ariaLabel="Minimum touch target"
                  value={settings.minTouchTarget}
                  min={24}
                  max={64}
                  step={2}
                  onValueChange={(v) => update({ minTouchTarget: v })}
                />
              }
            />
          </Card>
        </div>

        <div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Preferences
          </p>
          <Card className="divide-y divide-[var(--border)]">
            <Row
              title="Language"
              desc="Content language for readability"
              control={
                <Select
                  ariaLabel="Language"
                  value={settings.language}
                  onValueChange={(v) => update({ language: v })}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Español' },
                    { value: 'fr', label: 'Français' },
                    { value: 'de', label: 'Deutsch' },
                  ]}
                />
              }
            />
            <Row
              title="Dark mode"
              desc="Switch the plugin theme"
              control={
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(v) => update({ darkMode: v })}
                />
              }
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
