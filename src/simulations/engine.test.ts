import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { runExperienceAnalysis } from './engine';
import { applyMatrixToRgb, CVD_MATRICES } from './colorMatrices';
import { makeNode, makeSnapshot, makeText, solidFill } from '@/test/factory';

describe('runExperienceAnalysis', () => {
  it('produces a full experience report with all modules', () => {
    const button = makeNode({
      name: 'Icon Button',
      type: 'FRAME',
      width: 20,
      height: 20,
      reactions: [{ trigger: 'ON_HOVER', actionType: 'NODE' }],
    });
    const heading = makeNode({
      name: 'Title',
      type: 'TEXT',
      width: 200,
      height: 40,
      fills: [solidFill(0, 0, 0)],
      text: makeText('Welcome', { fontSize: 28, fontWeight: 700 }),
    });
    const video = makeNode({ name: 'Hero Video Player', width: 300, height: 200 });
    const root = makeNode({
      name: 'Screen',
      width: 375,
      height: 812,
      fills: [solidFill(1, 1, 1)],
      children: [heading, button, video],
    });

    const report = runExperienceAnalysis(makeSnapshot(root), DEFAULT_SETTINGS);

    expect(report.summary.score).toBeGreaterThanOrEqual(0);
    expect(report.summary.score).toBeLessThanOrEqual(100);
    expect(report.summary.categories.length).toBe(8);
    expect(report.screenReader.items.length).toBeGreaterThan(0);
    expect(report.cognitive.metrics.length).toBeGreaterThan(0);
    // The tiny hover-only control should be flagged for motor + keyboard.
    expect(report.motor.targets.some((t) => t.status !== 'pass')).toBe(true);
    expect(report.keyboard.issues.length).toBeGreaterThan(0);
    // The video without captions should be flagged for hearing.
    expect(report.hearing.media.some((m) => m.kind === 'video')).toBe(true);
  });
});

describe('CVD matrices', () => {
  it('achromatopsia collapses color to grayscale (r=g=b)', () => {
    const [r, g, b] = applyMatrixToRgb(CVD_MATRICES.achromatopsia, 200, 50, 10);
    expect(r).toBe(g);
    expect(g).toBe(b);
  });

  it('deuteranopia changes a pure green', () => {
    const [r, g, b] = applyMatrixToRgb(CVD_MATRICES.deuteranopia, 0, 255, 0);
    expect(r + g + b).toBeGreaterThan(0);
    // Green channel is remapped, not left at full 255.
    expect(g).toBeLessThan(255);
  });
});
