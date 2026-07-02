import type { AuditReport } from '@/types/analysis';
import { toCSV, toHTML, toJSON } from '@/core/reportGenerator';

export type ExportFormat = 'json' | 'csv' | 'pdf';

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

/**
 * ExportService — turns a report into a downloadable artifact.
 *
 * PDF export is delivered as a print-ready, self-contained HTML file (and an
 * attempted print window) since the Figma iframe sandbox cannot bundle a heavy
 * PDF library and has no network access.
 */
export const exportService = {
  export(report: AuditReport, format: ExportFormat): void {
    const base = `inclusive-audit-${timestamp()}`;
    switch (format) {
      case 'json':
        download(`${base}.json`, toJSON(report), 'application/json');
        break;
      case 'csv':
        download(`${base}.csv`, toCSV(report), 'text/csv');
        break;
      case 'pdf': {
        const html = toHTML(report);
        // Try to open a print window; fall back to downloading the HTML.
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          win.focus();
          setTimeout(() => win.print(), 400);
        } else {
          download(`${base}.html`, html, 'text/html');
        }
        break;
      }
    }
  },
};
