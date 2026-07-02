import { useAuditStore } from '@/store/useAuditStore';
import { useReport } from '@/hooks/useAudit';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ColorInventoryPanel } from './ColorInventoryPanel';

export function ColorsScreen() {
  const report = useReport();
  const analyze = useAuditStore((s) => s.analyze);

  if (!report) {
    return (
      <EmptyState
        icon="Palette"
        title="No color inventory yet"
        description="Run an accessibility audit to generate the color inventory for the selected frame."
        action={
          <Button size="sm" onClick={analyze}>
            Analyze Screen
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl p-5">
        <h2 className="mb-3 text-lg font-semibold">Color Inventory</h2>
        <ColorInventoryPanel inventory={report.colorInventory} />
      </div>
    </div>
  );
}
