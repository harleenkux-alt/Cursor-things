import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { createContext } from './base';
import { ContrastAnalyzer } from './contrastAnalyzer';
import { makeNode, makeSnapshot, makeText, solidFill } from '@/test/factory';

describe('ContrastAnalyzer', () => {
  it('flags low-contrast text and passes high-contrast text', () => {
    const lowContrast = makeNode({
      name: 'Faint label',
      type: 'TEXT',
      fills: [solidFill(0.8, 0.8, 0.8)],
      text: makeText('Barely visible text', { fontSize: 14 }),
    });
    const goodContrast = makeNode({
      name: 'Body',
      type: 'TEXT',
      fills: [solidFill(0.05, 0.05, 0.05)],
      text: makeText('Readable text', { fontSize: 16 }),
    });
    const root = makeNode({
      name: 'Frame',
      fills: [solidFill(1, 1, 1)],
      children: [lowContrast, goodContrast],
    });

    const ctx = createContext(makeSnapshot(root), DEFAULT_SETTINGS);
    const result = ContrastAnalyzer.analyze(ctx);

    expect(result.issues.length).toBe(1);
    expect(result.issues[0]?.affectedNodeIds).toContain(lowContrast.id);
    expect(result.issues[0]?.fix?.suggestedValue).toMatch(/^#/);
    expect(result.score).toBeLessThan(100);
  });
});
