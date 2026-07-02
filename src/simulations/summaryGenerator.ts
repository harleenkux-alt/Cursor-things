import type {
  ExperienceReport,
  ExperienceSummary,
  ExperienceCategoryScore,
} from '@/types/experience';

/**
 * SummaryGenerator — aggregates every experience module into a single
 * Accessibility Experience Score plus a radar-ready set of category scores.
 */
export function generateSummary(
  parts: Omit<ExperienceReport, 'summary' | 'generatedAt' | 'meta'>,
): ExperienceSummary {
  const categories: ExperienceCategoryScore[] = [
    { id: 'visual', label: 'Visual', score: parts.visual.score },
    { id: 'color', label: 'Color', score: parts.color.score },
    { id: 'motor', label: 'Motor', score: parts.motor.score },
    { id: 'keyboard', label: 'Keyboard', score: parts.keyboard.score },
    { id: 'screenReader', label: 'Screen Reader', score: parts.screenReader.score },
    { id: 'cognitive', label: 'Cognitive', score: parts.cognitive.score },
    { id: 'motion', label: 'Motion', score: parts.motion.score },
    { id: 'hearing', label: 'Hearing', score: parts.hearing.score },
  ];

  const score = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  );

  const issueCount =
    parts.motor.gestureIssues.length +
    parts.motor.targets.filter((t) => t.status !== 'pass').length +
    parts.hearing.media.filter((m) => m.status !== 'pass').length +
    parts.screenReader.problems.length +
    parts.keyboard.issues.length +
    parts.motion.items.filter((i) => i.status !== 'pass').length +
    parts.color.pairs.filter((p) => p.status !== 'pass').length;

  const recommendations = dedupe([
    ...parts.visual.recommendations,
    ...parts.color.recommendations,
    ...parts.motor.recommendations,
    ...parts.keyboard.issues.flatMap((i) => (i.status === 'fail' ? [i.title] : [])),
    ...parts.cognitive.recommendations,
    ...parts.motion.recommendations,
    ...parts.hearing.recommendations,
  ]).slice(0, 8);

  return { score, categories, issueCount, recommendations };
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)];
}
