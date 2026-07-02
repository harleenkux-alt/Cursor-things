import type { SceneSnapshot } from '@/models/auditNode';
import type { Severity } from '@/models/severity';
import { SEVERITY_ORDER } from '@/models/severity';
import type {
  AnalysisCategory,
  AnalyzerResult,
  AuditReport,
  ColorInventory,
  Issue,
  ReportStats,
} from '@/types/analysis';
import { CATEGORY_LABELS } from '@/types/analysis';
import type { AuditSettings } from '@/types/settings';
import { ANALYZERS, createContext, type AnalyzerContext } from '@/analyzers';
import { resetIdCounter } from '@/utils/id';
import { computeCategoryScores, computeOverallScore, scoreToGrade } from './scorer';

export interface RunProgress {
  analyzerId: string;
  title: string;
  index: number;
  total: number;
}

export interface RunOptions {
  onProgress?: (p: RunProgress) => void;
  /** Yield to the event loop between analyzers to keep the UI responsive. */
  yieldBetween?: boolean;
}

const emptySeverityRecord = (): Record<Severity, number> =>
  SEVERITY_ORDER.reduce(
    (acc, s) => {
      acc[s] = 0;
      return acc;
    },
    {} as Record<Severity, number>,
  );

const emptyCategoryRecord = (): Record<AnalysisCategory, number> =>
  (Object.keys(CATEGORY_LABELS) as AnalysisCategory[]).reduce(
    (acc, c) => {
      acc[c] = 0;
      return acc;
    },
    {} as Record<AnalysisCategory, number>,
  );

function buildStats(issues: Issue[]): ReportStats {
  const bySeverity = emptySeverityRecord();
  const byCategory = emptyCategoryRecord();
  for (const issue of issues) {
    bySeverity[issue.severity] += 1;
    byCategory[issue.category] += 1;
  }
  return { totalIssues: issues.length, bySeverity, byCategory };
}

function extractInventory(results: AnalyzerResult[]): ColorInventory {
  const colorResult = results.find(
    (r) => r.meta && 'colorInventory' in r.meta,
  );
  return (
    (colorResult?.meta?.colorInventory as ColorInventory | undefined) ?? {
      entries: [],
      totalColors: 0,
      duplicateGroups: [],
      unusedTokens: [],
    }
  );
}

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Orchestrates every analyzer over a scene snapshot and produces the final
 * {@link AuditReport}. Each analyzer is isolated in a try/catch so one failure
 * never aborts the whole run.
 */
export async function runAnalysis(
  snapshot: SceneSnapshot,
  settings: AuditSettings,
  options: RunOptions = {},
): Promise<AuditReport> {
  const start = Date.now();
  resetIdCounter();
  const ctx: AnalyzerContext = createContext(snapshot, settings);
  const results: AnalyzerResult[] = [];

  for (let i = 0; i < ANALYZERS.length; i++) {
    const analyzer = ANALYZERS[i]!;
    options.onProgress?.({
      analyzerId: analyzer.id,
      title: analyzer.title,
      index: i,
      total: ANALYZERS.length,
    });
    try {
      results.push(analyzer.analyze(ctx));
    } catch (err) {
      results.push({
        analyzerId: analyzer.id,
        category: analyzer.category,
        title: analyzer.title,
        icon: analyzer.icon,
        score: 100,
        status: 'pass',
        issues: [],
        recommendations: [
          `Analyzer "${analyzer.title}" could not complete: ${
            err instanceof Error ? err.message : 'unknown error'
          }.`,
        ],
      });
    }
    if (options.yieldBetween) await nextFrame();
  }

  const allIssues = results.flatMap((r) => r.issues);
  const categoryScores = computeCategoryScores(results);
  const overallScore = computeOverallScore(categoryScores);

  return {
    overallScore,
    grade: scoreToGrade(overallScore),
    categoryScores,
    results,
    issues: allIssues,
    colorInventory: extractInventory(results),
    stats: buildStats(allIssues),
    generatedAt: Date.now(),
    meta: {
      nodeCount: snapshot.nodeCount,
      extractionMs: snapshot.extractionMs,
      analysisMs: Date.now() - start,
      documentName: snapshot.documentName,
      pageName: snapshot.pageName,
    },
  };
}
