import type { AnalyzerContext } from '@/analyzers/base';
import { ContrastAnalyzer } from '@/analyzers/contrastAnalyzer';
import type { VisualExperienceResult } from '@/types/experience';
import { clampScore } from './types';

/**
 * VisualExperience — a heuristic score for how well the design holds up under
 * reduced-vision conditions. It reuses the contrast analyzer's pass rate (the
 * strongest predictor of low-vision legibility) rather than re-implementing it.
 */
export function runVisualExperience(ctx: AnalyzerContext): VisualExperienceResult {
  const result = ContrastAnalyzer.analyze(ctx);
  const passRate = (result.meta?.passRate as number | undefined) ?? 100;
  const checked = (result.meta?.checked as number | undefined) ?? 0;
  const failed = checked - ((result.meta?.passed as number | undefined) ?? checked);
  const lowContrastRatio = checked > 0 ? failed / checked : 0;

  const recommendations: string[] = [];
  if (passRate < 100)
    recommendations.push(
      'Increase text contrast — low-contrast text is the first thing to disappear under reduced vision.',
    );
  recommendations.push('Avoid conveying meaning with thin, low-contrast lines or subtle tints.');
  recommendations.push('Test the design at 200% zoom to confirm nothing is clipped or lost.');

  return {
    score: clampScore(passRate),
    lowContrastRatio: Math.round(lowContrastRatio * 100) / 100,
    recommendations,
  };
}
