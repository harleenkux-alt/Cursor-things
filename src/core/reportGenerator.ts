import type { AuditReport, Issue } from '@/types/analysis';
import { SEVERITY_META } from '@/models/severity';

/**
 * ReportGenerator — serializes an {@link AuditReport} into shareable formats
 * (JSON, CSV, and a self-contained printable HTML document that can be saved
 * as PDF from the browser's print dialog).
 */

export function toJSON(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

function csvEscape(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function toCSV(report: AuditReport): string {
  const header = [
    'Category',
    'Severity',
    'Title',
    'Description',
    'WCAG',
    'Level',
    'Affected Layers',
    'Fix',
  ];
  const rows = report.issues.map((issue: Issue) =>
    [
      issue.category,
      issue.severity,
      issue.title,
      issue.description,
      issue.wcag ?? '',
      issue.wcagLevel ?? '',
      issue.affectedLayerNames.join(' | '),
      issue.fix ? `${issue.fix.label}${issue.fix.recommended ? ` → ${issue.fix.recommended}` : ''}` : '',
    ]
      .map((cell) => csvEscape(String(cell)))
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}

export function toHTML(report: AuditReport): string {
  const date = new Date(report.generatedAt).toLocaleString();
  const categoryRows = report.categoryScores
    .map(
      (c) => `
        <tr>
          <td>${c.label}</td>
          <td><strong>${c.score}</strong></td>
          <td>${c.grade}</td>
          <td>${c.issueCount}</td>
        </tr>`,
    )
    .join('');

  const issueRows = report.issues
    .map((issue) => {
      const meta = SEVERITY_META[issue.severity];
      return `
        <tr>
          <td><span class="pill" style="background:${meta.color}1a;color:${meta.color}">${meta.label}</span></td>
          <td><strong>${escapeHtml(issue.title)}</strong><div class="muted">${escapeHtml(issue.description)}</div></td>
          <td>${issue.wcag ? escapeHtml(issue.wcag) : '—'}</td>
          <td>${escapeHtml(issue.affectedLayerNames.slice(0, 4).join(', ')) || '—'}</td>
        </tr>`;
    })
    .join('');

  const recommendations = Array.from(
    new Set(report.results.flatMap((r) => r.recommendations)),
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Inclusive Audit Report — ${escapeHtml(report.meta.pageName)}</title>
<style>
  :root { --brand:#005FCC; }
  * { box-sizing:border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a; margin:0; padding:48px; background:#f8fafc; }
  .wrap { max-width:880px; margin:0 auto; }
  header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; }
  h1 { font-size:26px; margin:0; }
  h2 { font-size:16px; text-transform:uppercase; letter-spacing:.05em; color:#64748b; margin:36px 0 12px; }
  .muted { color:#64748b; font-size:12px; margin-top:4px; }
  .score { text-align:center; background:white; border-radius:16px; padding:28px; box-shadow:0 4px 16px rgba(15,23,42,.06); }
  .score .big { font-size:64px; font-weight:700; color:var(--brand); line-height:1; }
  .grade { display:inline-block; margin-top:8px; padding:4px 12px; border-radius:999px; background:var(--brand); color:white; font-weight:600; }
  table { width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(15,23,42,.05); }
  th,td { text-align:left; padding:12px 16px; border-bottom:1px solid #eef2f7; font-size:13px; vertical-align:top; }
  th { background:#f1f5f9; font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:#64748b; }
  .pill { padding:2px 10px; border-radius:999px; font-size:11px; font-weight:600; }
  ul { padding-left:18px; } li { margin:6px 0; font-size:13px; }
  @media print { body { background:white; padding:0; } .score, table { box-shadow:none; } }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>Inclusive Audit Report</h1>
        <div class="muted">${escapeHtml(report.meta.documentName)} · ${escapeHtml(report.meta.pageName)} · ${date}</div>
      </div>
    </header>

    <div class="score">
      <div class="big">${report.overallScore}</div>
      <div class="grade">Grade ${report.grade}</div>
      <div class="muted">${report.stats.totalIssues} issue(s) across ${report.meta.nodeCount} layers · analyzed in ${report.meta.analysisMs}ms</div>
    </div>

    <h2>Category Scores</h2>
    <table>
      <thead><tr><th>Category</th><th>Score</th><th>Grade</th><th>Issues</th></tr></thead>
      <tbody>${categoryRows}</tbody>
    </table>

    <h2>Recommendations</h2>
    <ul>${recommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>

    <h2>Issues (${report.issues.length})</h2>
    <table>
      <thead><tr><th>Severity</th><th>Issue</th><th>WCAG</th><th>Layers</th></tr></thead>
      <tbody>${issueRows || '<tr><td colspan="4">No issues found 🎉</td></tr>'}</tbody>
    </table>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
