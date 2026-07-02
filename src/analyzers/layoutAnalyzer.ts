import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, makeResult } from './base';

/** Depth beyond which nesting becomes hard to maintain and slow to render. */
const MAX_HEALTHY_DEPTH = 12;

/**
 * LayoutAnalyzer — structural health: nesting depth, overflow, constraints and
 * responsive readiness. Contributes to the "Visual" category.
 */
export const LayoutAnalyzer: Analyzer = {
  id: 'layout',
  category: 'visual',
  title: 'Layout & Structure',
  icon: 'LayoutDashboard',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    // 1) Excessive nesting depth.
    const maxDepth = ctx.nodes.reduce((m, n) => Math.max(m, n.depth), 0);
    const deepNodes = ctx.nodes.filter((n) => n.depth > MAX_HEALTHY_DEPTH);
    if (deepNodes.length > 0) {
      issues.push(
        buildIssue({
          category: 'visual',
          analyzerId: 'layout',
          title: `Deep nesting (${maxDepth} levels)`,
          description: `${deepNodes.length} layers are nested more than ${MAX_HEALTHY_DEPTH} levels deep. Flatten unnecessary groups to keep the structure understandable.`,
          severity: 'low',
          nodes: deepNodes.slice(0, 12),
        }),
      );
      recommendations.push('Flatten redundant groups and wrapper frames.');
    }

    // 2) Overflow — children extending beyond their parent bounds.
    const overflowing: AuditNode[] = [];
    for (const node of ctx.visibleNodes) {
      const parent = ctx.parentOf(node.id);
      if (!parent || parent.type === 'GROUP') continue;
      const overflowsRight = node.x + node.width > parent.x + parent.width + 1;
      const overflowsBottom = node.y + node.height > parent.y + parent.height + 1;
      const overflowsLeft = node.x < parent.x - 1;
      const overflowsTop = node.y < parent.y - 1;
      if (
        (overflowsRight || overflowsBottom || overflowsLeft || overflowsTop) &&
        parent.layoutMode === 'NONE'
      ) {
        overflowing.push(node);
      }
    }
    if (overflowing.length > 0) {
      issues.push(
        buildIssue({
          category: 'visual',
          analyzerId: 'layout',
          title: `Content overflow (${overflowing.length} layers)`,
          description: `${overflowing.length} layers extend beyond their parent frame. On smaller viewports this content may be clipped or invisible.`,
          severity: 'medium',
          nodes: overflowing.slice(0, 12),
        }),
      );
      recommendations.push('Keep children within their parent bounds or enable clipping intentionally.');
    }

    // 3) Responsive readiness — top-level frame relies on fixed positioning.
    const topContainers = ctx.root.children.filter((c) => c.visible);
    const fixedPositioned = topContainers.filter(
      (c) =>
        ctx.root.layoutMode === 'NONE' &&
        c.constraints?.horizontal === 'MIN' &&
        c.constraints?.vertical === 'MIN',
    );
    const responsiveScoreBase =
      ctx.root.layoutMode !== 'NONE'
        ? 100
        : topContainers.length > 0
          ? Math.round(
              ((topContainers.length - fixedPositioned.length) / topContainers.length) *
                100,
            )
          : 100;

    if (ctx.root.layoutMode === 'NONE' && fixedPositioned.length > 3) {
      issues.push(
        buildIssue({
          category: 'visual',
          analyzerId: 'layout',
          title: 'Not responsive-ready',
          description: `The root frame uses absolute positioning with fixed (top-left) constraints on ${fixedPositioned.length} children. Adopt Auto Layout or flexible constraints so the design adapts to different screen sizes.`,
          severity: 'low',
          nodes: [],
        }),
      );
      recommendations.push('Add Auto Layout or scaling constraints for responsive behavior.');
    }

    return makeResult(this, issues, recommendations, {
      maxDepth,
      responsiveReadiness: responsiveScoreBase,
      rootUsesAutoLayout: ctx.root.layoutMode !== 'NONE',
    });
  },
};
