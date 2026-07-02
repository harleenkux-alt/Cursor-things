import type { AuditNode, SceneSnapshot } from '@/models/auditNode';
import { flattenNodes } from '@/models/auditNode';
import type { Severity } from '@/models/severity';
import { SEVERITY_WEIGHT } from '@/models/severity';
import type {
  AnalysisCategory,
  AnalyzerResult,
  FixSuggestion,
  Issue,
} from '@/types/analysis';
import type { AuditSettings } from '@/types/settings';
import { clamp } from '@/utils/math';
import { makeId } from '@/utils/id';
import { truncate } from '@/utils/text';

/**
 * Shared context handed to every analyzer. It carries the immutable scene
 * snapshot, a pre-flattened node list (computed once for performance), and the
 * active audit settings.
 */
export interface AnalyzerContext {
  snapshot: SceneSnapshot;
  root: AuditNode;
  /** Depth-first, visible-and-invisible flattened list of every node. */
  nodes: AuditNode[];
  /** Only visible nodes — most analyzers should iterate this. */
  visibleNodes: AuditNode[];
  settings: AuditSettings;
  /** Fast lookup of a node's parent. */
  parentOf: (id: string) => AuditNode | undefined;
}

export function createContext(
  snapshot: SceneSnapshot,
  settings: AuditSettings,
): AnalyzerContext {
  const nodes = flattenNodes(snapshot.root);
  const parents = new Map<string, AuditNode>();
  for (const node of nodes) {
    for (const child of node.children) parents.set(child.id, node);
  }
  return {
    snapshot,
    root: snapshot.root,
    nodes,
    visibleNodes: nodes.filter((n) => n.visible && n.opacity > 0.01),
    settings,
    parentOf: (id) => parents.get(id),
  };
}

/** Every analyzer implements this contract. */
export interface Analyzer {
  id: string;
  category: AnalysisCategory;
  title: string;
  icon: string;
  analyze(ctx: AnalyzerContext): AnalyzerResult;
}

// ---------------------------------------------------------------------------
// Issue & result construction helpers
// ---------------------------------------------------------------------------

export interface IssueInput {
  category: AnalysisCategory;
  analyzerId: string;
  title: string;
  description: string;
  severity: Severity;
  wcag?: string;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  nodes: AuditNode[];
  fix?: FixSuggestion;
}

export function buildIssue(input: IssueInput): Issue {
  return {
    id: makeId(input.analyzerId),
    category: input.category,
    analyzerId: input.analyzerId,
    title: input.title,
    description: input.description,
    severity: input.severity,
    wcag: input.wcag,
    wcagLevel: input.wcagLevel,
    affectedNodeIds: input.nodes.map((n) => n.id),
    affectedLayerNames: input.nodes.map((n) => truncate(n.name, 32)),
    fix: input.fix,
  };
}

/**
 * Derive a 0..100 score from a set of issues. We penalize by severity weight
 * but dampen the penalty logarithmically so a screen with many minor issues is
 * not driven to zero unfairly.
 */
export function scoreFromIssues(issues: Issue[], base = 100): number {
  if (issues.length === 0) return base;
  let penalty = 0;
  const counts: Partial<Record<Severity, number>> = {};
  for (const issue of issues) {
    counts[issue.severity] = (counts[issue.severity] ?? 0) + 1;
  }
  for (const [severity, count] of Object.entries(counts)) {
    const weight = SEVERITY_WEIGHT[severity as Severity];
    // First occurrence costs full weight; subsequent ones taper off.
    penalty += weight * (1 + Math.log2((count ?? 0) + 1) - 1);
  }
  return Math.round(clamp(base - penalty, 0, 100));
}

export function statusFromScore(score: number): 'pass' | 'warn' | 'fail' {
  if (score >= 85) return 'pass';
  if (score >= 60) return 'warn';
  return 'fail';
}

export function makeResult(
  analyzer: Pick<Analyzer, 'id' | 'category' | 'title' | 'icon'>,
  issues: Issue[],
  recommendations: string[],
  meta?: Record<string, unknown>,
  scoreOverride?: number,
): AnalyzerResult {
  const score = scoreOverride ?? scoreFromIssues(issues);
  return {
    analyzerId: analyzer.id,
    category: analyzer.category,
    title: analyzer.title,
    icon: analyzer.icon,
    score,
    status: statusFromScore(score),
    issues,
    recommendations,
    meta,
  };
}

// ---------------------------------------------------------------------------
// Small shared predicates
// ---------------------------------------------------------------------------

export function isTouchTargetCandidate(node: AuditNode): boolean {
  const name = node.name.toLowerCase();
  const interactive =
    /button|btn|cta|link|chip|tab|toggle|switch|checkbox|radio|icon|action|fab|menu\s?item/.test(
      name,
    ) ||
    node.reactions.length > 0 ||
    node.type === 'INSTANCE';
  return interactive && node.width > 0 && node.height > 0;
}

export function looksLikeText(node: AuditNode): boolean {
  return node.type === 'TEXT' && !!node.text && node.text.characters.trim().length > 0;
}

export function isLargeText(fontSize: number, weight: number): boolean {
  // WCAG "large text": >= 18pt (~24px), or >= 14pt (~18.66px) bold.
  return fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
}
