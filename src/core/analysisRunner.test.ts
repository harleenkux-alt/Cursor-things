import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { runAnalysis } from './analysisRunner';
import { makeNode, makeSnapshot, makeText, solidFill } from '@/test/factory';
import type { AuditNode } from '@/models/auditNode';

function buildLargeTree(count: number): AuditNode {
  const children: AuditNode[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      makeNode({
        name: i % 3 === 0 ? `Button ${i}` : `Text ${i}`,
        type: i % 2 === 0 ? 'TEXT' : 'FRAME',
        width: 40,
        height: 40,
        fills: [solidFill(Math.random(), Math.random(), Math.random())],
        text:
          i % 2 === 0
            ? makeText(`Sample content number ${i}`, { fontSize: i % 7 === 0 ? 9 : 16 })
            : undefined,
      }),
    );
  }
  return makeNode({
    name: 'Screen',
    width: 375,
    height: 812,
    fills: [solidFill(1, 1, 1)],
    children,
  });
}

describe('runAnalysis', () => {
  it('produces a complete report with all categories', async () => {
    const root = buildLargeTree(20);
    const report = await runAnalysis(makeSnapshot(root), DEFAULT_SETTINGS);

    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(report.results.length).toBeGreaterThan(5);
    expect(report.categoryScores.length).toBeGreaterThan(0);
    expect(report.colorInventory.entries.length).toBeGreaterThan(0);
    expect(['AAA', 'AA', 'A', 'B', 'C', 'F']).toContain(report.grade);
  });

  it('analyzes 500+ layers in well under 5 seconds', async () => {
    const root = buildLargeTree(520);
    const snapshot = makeSnapshot(root);
    expect(snapshot.nodeCount).toBeGreaterThan(500);

    const start = Date.now();
    const report = await runAnalysis(snapshot, DEFAULT_SETTINGS);
    const elapsed = Date.now() - start;

    expect(report.stats.totalIssues).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(5000);
  });
});
