import type { AuditReport } from '@/types/analysis';
import { exportService } from '@/services/exportService';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function ExportBar({ report }: { report: AuditReport }) {
  return (
    <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
      <span className="mr-auto text-[11px] font-medium text-muted">Export report</span>
      <Button variant="secondary" size="sm" onClick={() => exportService.export(report, 'pdf')}>
        <Icon name="FileText" size={14} />
        PDF
      </Button>
      <Button variant="secondary" size="sm" onClick={() => exportService.export(report, 'json')}>
        <Icon name="FileJson" size={14} />
        JSON
      </Button>
      <Button variant="secondary" size="sm" onClick={() => exportService.export(report, 'csv')}>
        <Icon name="Download" size={14} />
        CSV
      </Button>
    </div>
  );
}
