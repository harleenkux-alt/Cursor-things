import type {
  AnalysisCategory,
  AnalyzerResult,
  CategoryScore,
  Grade,
} from '@/types/analysis';
import { CATEGORY_LABELS } from '@/types/analysis';
import { clamp } from '@/utils/math';

/**
 * AccessibilityScorer — aggregates analyzer sub-scores into category scores,
 * an overall score, and letter/WCAG grades.
 *
 * Category scores are weighted averages of the analyzers that feed them; the
 * overall score is a weighted average of the categories, with accessibility-
 * critical categories (color, typography, interaction) weighted more heavily.
 */

const CATEGORY_WEIGHT: Record<AnalysisCategory, number> = {
  color: 1.4,
  typography: 1.2,
  interaction: 1.3,
  visual: 1.0,
  components: 1.0,
  inclusive: 1.1,
  cognitive: 1.0,
  motion: 0.6,
  content: 0.9,
};

export function scoreToGrade(score: number): Grade {
  if (score >= 95) return 'AAA';
  if (score >= 85) return 'AA';
  if (score >= 75) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  return 'F';
}

export function computeCategoryScores(results: AnalyzerResult[]): CategoryScore[] {
  const byCategory = new Map<AnalysisCategory, AnalyzerResult[]>();
  for (const result of results) {
    const list = byCategory.get(result.category) ?? [];
    list.push(result);
    byCategory.set(result.category, list);
  }

  const scores: CategoryScore[] = [];
  for (const [category, list] of byCategory) {
    const avg = list.reduce((sum, r) => sum + r.score, 0) / list.length;
    const issueCount = list.reduce((sum, r) => sum + r.issues.length, 0);
    const score = Math.round(clamp(avg, 0, 100));
    scores.push({
      category,
      label: CATEGORY_LABELS[category],
      score,
      grade: scoreToGrade(score),
      issueCount,
    });
  }

  // Stable, spec-aligned ordering.
  const order: AnalysisCategory[] = [
    'visual',
    'interaction',
    'typography',
    'color',
    'components',
    'inclusive',
    'cognitive',
    'motion',
    'content',
  ];
  scores.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  return scores;
}

export function computeOverallScore(categoryScores: CategoryScore[]): number {
  if (categoryScores.length === 0) return 100;
  let weighted = 0;
  let totalWeight = 0;
  for (const cs of categoryScores) {
    const w = CATEGORY_WEIGHT[cs.category] ?? 1;
    weighted += cs.score * w;
    totalWeight += w;
  }
  return Math.round(clamp(weighted / totalWeight, 0, 100));
}
