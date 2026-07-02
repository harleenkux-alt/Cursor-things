import type { AnalyzerContext } from '@/analyzers/base';
import { looksLikeText } from '@/analyzers/base';
import type {
  CognitiveExperienceResult,
  CognitiveMetric,
  CognitiveRating,
} from '@/types/experience';
import { readability } from '@/utils/text';
import { clampScore } from './types';

/**
 * CognitiveExperience — heuristic analysis (NOT a disability simulation) of the
 * mental effort a screen demands: reading level, density, competing actions,
 * navigation/form complexity, and distraction.
 */
export function runCognitiveExperience(ctx: AnalyzerContext): CognitiveExperienceResult {
  const nodes = ctx.visibleNodes;
  const textNodes = nodes.filter(looksLikeText);
  const allText = textNodes.map((n) => n.text!.characters).join('. ');
  const words = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const r = readability(allText);

  const count = (re: RegExp) => nodes.filter((n) => re.test(n.name)).length;
  const primary = nodes.filter(
    (n) => /button|btn|cta/i.test(n.name) && /primary|submit|continue|confirm|next|save|cta/i.test(n.name),
  ).length;
  const buttons = count(/button|btn|cta/i);
  const secondary = Math.max(0, buttons - primary);
  const inputs = count(/input|field|textbox|textarea|select|dropdown/i);
  const navItems = count(/nav|tab|menu\s?item|link/i);
  const alerts = count(/alert|toast|notification|banner|badge/i);

  const areaK = Math.max(1, (ctx.root.width * ctx.root.height) / 1000);
  const density = words / areaK;
  const readingTimeSec = Math.round((words / 200) * 60);

  const metrics: CognitiveMetric[] = [
    metric('readingLevel', 'Reading Level', words ? `Grade ${r.fleschKincaidGrade}` : 'N/A',
      words === 0 ? 'good' : ratingFromThresholds(r.fleschKincaidGrade, 8, 11, 14),
      'Aim for grade 8–9 for a general audience.'),
    metric('readingTime', 'Reading Time', formatTime(readingTimeSec),
      ratingFromThresholds(readingTimeSec, 30, 90, 180),
      'Long reading times suggest trimming or chunking content.'),
    metric('density', 'Information Density', `${density.toFixed(2)} w/kpx²`,
      ratingFromThresholds(density, 0.3, 0.6, 1.0),
      'High density overwhelms; add whitespace and structure.'),
    metric('primary', 'Primary Actions', String(primary),
      primary <= 1 ? 'excellent' : primary === 2 ? 'good' : primary === 3 ? 'needsImprovement' : 'critical',
      'Keep one clear primary action per screen.'),
    metric('secondary', 'Secondary Actions', String(secondary),
      ratingFromThresholds(secondary, 3, 6, 10),
      'Too many secondary actions dilute focus.'),
    metric('navigation', 'Navigation Complexity', String(navItems),
      ratingFromThresholds(navItems, 5, 9, 14),
      'Group and prioritize navigation items.'),
    metric('form', 'Form Complexity', `${inputs} fields`,
      ratingFromThresholds(inputs, 4, 8, 12),
      'Split long forms into steps; remove optional fields.'),
    metric('cognitiveLoad', 'Cognitive Load', loadLabel(buttons + inputs + navItems),
      ratingFromThresholds(buttons + inputs + navItems, 8, 15, 25),
      'Reduce the total number of simultaneous choices.'),
    metric('distraction', 'Distraction Score', String(alerts),
      ratingFromThresholds(alerts, 2, 4, 6),
      'Competing alerts and badges pull attention away.'),
  ];

  const ratingScore: Record<CognitiveRating, number> = {
    excellent: 100,
    good: 82,
    needsImprovement: 60,
    critical: 35,
  };
  const score = clampScore(
    metrics.reduce((sum, m) => sum + ratingScore[m.rating], 0) / metrics.length,
  );

  const recommendations: string[] = [];
  if (metrics.find((m) => m.id === 'density' && bad(m.rating)))
    recommendations.push('Reduce text density — break content into sections with whitespace.');
  if (primary > 1) recommendations.push('Reduce competing primary actions to a single call to action.');
  if (navItems > 9) recommendations.push('Simplify navigation and group related items.');
  if (inputs > 8) recommendations.push('Break the form into logical, shorter steps.');
  if (words && r.fleschKincaidGrade > 11)
    recommendations.push('Use plain language and shorter sentences.');
  if (recommendations.length === 0)
    recommendations.push('Cognitive load looks well managed — maintain clear hierarchy.');

  return { score, metrics, recommendations };
}

function metric(
  id: string,
  label: string,
  value: string,
  rating: CognitiveRating,
  hint: string,
): CognitiveMetric {
  return { id, label, value, rating, hint };
}

function ratingFromThresholds(
  value: number,
  good: number,
  ni: number,
  critical: number,
): CognitiveRating {
  if (value <= good) return 'excellent';
  if (value <= ni) return 'good';
  if (value <= critical) return 'needsImprovement';
  return 'critical';
}

function bad(rating: CognitiveRating): boolean {
  return rating === 'needsImprovement' || rating === 'critical';
}

function loadLabel(total: number): string {
  if (total <= 8) return `Low (${total})`;
  if (total <= 15) return `Moderate (${total})`;
  if (total <= 25) return `High (${total})`;
  return `Very High (${total})`;
}

function formatTime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}
