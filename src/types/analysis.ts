import type { Severity } from '@/models/severity';

/**
 * The high-level report categories surfaced on the result screen. Multiple
 * analyzers may contribute to the same category (e.g. the contrast and color
 * analyzers both feed the "color" category).
 */
export type AnalysisCategory =
  | 'visual'
  | 'interaction'
  | 'typography'
  | 'color'
  | 'components'
  | 'inclusive'
  | 'cognitive'
  | 'motion'
  | 'content';

export const CATEGORY_LABELS: Record<AnalysisCategory, string> = {
  visual: 'Visual',
  interaction: 'Interaction',
  typography: 'Typography',
  color: 'Color',
  components: 'Components',
  inclusive: 'Inclusive Design',
  cognitive: 'Cognitive Accessibility',
  motion: 'Motion',
  content: 'Content',
};

/** A concrete, node-scoped fix the user can (eventually) apply. */
export interface FixSuggestion {
  /** Machine-readable fix kind used by the remediation service. */
  kind:
    | 'setFontSize'
    | 'setLineHeight'
    | 'setFillColor'
    | 'setTextColor'
    | 'resize'
    | 'addAutoLayout'
    | 'manual';
  label: string;
  description?: string;
  current?: string;
  recommended?: string;
  /** Suggested replacement value (hex color, px value, etc.). */
  suggestedValue?: string;
  /** Node the fix applies to. */
  nodeId?: string;
  /** Whether the plugin can apply this automatically. */
  autoFixable: boolean;
}

/** A single detected accessibility / inclusive-design problem. */
export interface Issue {
  id: string;
  category: AnalysisCategory;
  analyzerId: string;
  title: string;
  description: string;
  severity: Severity;
  /** WCAG success criterion reference, e.g. "1.4.3 Contrast (Minimum)". */
  wcag?: string;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  /** IDs of the Figma nodes this issue affects (for the Locate button). */
  affectedNodeIds: string[];
  /** Human-friendly names of affected layers. */
  affectedLayerNames: string[];
  fix?: FixSuggestion;
}

/** The result produced by a single analyzer. */
export interface AnalyzerResult {
  analyzerId: string;
  category: AnalysisCategory;
  title: string;
  /** Lucide icon name used by the UI. */
  icon: string;
  /** 0..100 sub-score contributed by this analyzer. */
  score: number;
  status: 'pass' | 'warn' | 'fail';
  issues: Issue[];
  recommendations: string[];
  /** Arbitrary structured payload for rich section rendering. */
  meta?: Record<string, unknown>;
}

/** Aggregated score for a report category. */
export interface CategoryScore {
  category: AnalysisCategory;
  label: string;
  score: number;
  grade: Grade;
  issueCount: number;
}

export type Grade = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'F';

export interface AuditReport {
  overallScore: number;
  grade: Grade;
  categoryScores: CategoryScore[];
  results: AnalyzerResult[];
  issues: Issue[];
  colorInventory: ColorInventory;
  stats: ReportStats;
  generatedAt: number;
  meta: {
    nodeCount: number;
    extractionMs: number;
    analysisMs: number;
    documentName: string;
    pageName: string;
  };
}

export interface ReportStats {
  totalIssues: number;
  bySeverity: Record<Severity, number>;
  byCategory: Record<AnalysisCategory, number>;
}

// ---------------------------------------------------------------------------
// Color inventory
// ---------------------------------------------------------------------------

export type ColorRole =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'semantic'
  | 'background'
  | 'surface'
  | 'border'
  | 'text';

export interface ColorNeighbor {
  hex: string;
  ratio: number;
}

export interface ColorEntry {
  token: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  role: ColorRole;
  usageCount: number;
  contrastWithWhite: number;
  contrastWithBlack: number;
  neighbors: ColorNeighbor[];
  /** Best WCAG rating this color reaches against white or black as text. */
  rating: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  suggestedReplacement?: string;
}

export interface ColorInventory {
  entries: ColorEntry[];
  totalColors: number;
  duplicateGroups: string[][];
  unusedTokens: string[];
}
