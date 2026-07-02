import type { AnalyzerContext } from '@/analyzers/base';

/**
 * Contract for a non-visual experience module (motor, hearing, screen reader,
 * keyboard, cognitive, motion, color). Visual/CVD simulations are rendered live
 * on canvas and therefore don't implement this interface.
 *
 * Each module is independent and reusable, following the same open/closed
 * principle as the audit analyzers: add a module, register it in the engine.
 */
export interface SimulationModule<TResult> {
  id: string;
  run(ctx: AnalyzerContext): TResult;
}

export function clampScore(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

let simIssueCounter = 0;
export function simId(prefix: string): string {
  simIssueCounter += 1;
  return `${prefix}-${simIssueCounter.toString(36)}`;
}
export function resetSimIds(): void {
  simIssueCounter = 0;
}
