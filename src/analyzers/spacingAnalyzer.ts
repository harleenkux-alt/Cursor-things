import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import { frequency, isOnGrid } from '@/utils/math';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, makeResult } from './base';

/**
 * SpacingAnalyzer — grid alignment, auto-layout adoption, and spacing
 * consistency. Contributes to the "Visual" category.
 */
export const SpacingAnalyzer: Analyzer = {
  id: 'spacing',
  category: 'visual',
  title: 'Spacing & Grid',
  icon: 'Ruler',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    const containers = ctx.visibleNodes.filter(
      (n) => n.children.length >= 2 && (n.type === 'FRAME' || n.type === 'GROUP'),
    );

    // 1) Auto Layout adoption.
    const autoLayoutContainers = containers.filter((n) => n.layoutMode !== 'NONE');
    const manualContainers = containers.filter(
      (n) => n.layoutMode === 'NONE' && n.type === 'FRAME',
    );
    const adoption =
      containers.length > 0
        ? Math.round((autoLayoutContainers.length / containers.length) * 100)
        : 100;

    if (manualContainers.length > 0 && adoption < 60) {
      issues.push(
        buildIssue({
          category: 'visual',
          analyzerId: 'spacing',
          title: `Low Auto Layout adoption (${adoption}%)`,
          description: `${manualContainers.length} multi-child frames don't use Auto Layout. Auto Layout keeps spacing consistent and makes layouts responsive.`,
          severity: 'low',
          nodes: manualContainers.slice(0, 15),
        }),
      );
      recommendations.push('Convert manually-positioned frames to Auto Layout.');
    }

    // 2) Off-grid spacing in auto layout.
    const offGrid = autoLayoutContainers.filter(
      (n) => n.itemSpacing > 0 && !isOnGrid(n.itemSpacing),
    );
    if (offGrid.length > 0) {
      issues.push(
        buildIssue({
          category: 'visual',
          analyzerId: 'spacing',
          title: `Off-grid spacing values (${offGrid.length})`,
          description: `${offGrid.length} containers use spacing that doesn't align to a 4/8px grid (e.g. ${offGrid
            .slice(0, 4)
            .map((n) => `${n.itemSpacing}px`)
            .join(', ')}). Snap spacing to the base grid for visual rhythm.`,
          severity: 'low',
          nodes: offGrid.slice(0, 15),
        }),
      );
      recommendations.push('Use spacing values from a consistent 4/8px scale.');
    }

    // 3) Spacing inconsistency — too many distinct spacing values.
    const spacings = autoLayoutContainers
      .map((n) => n.itemSpacing)
      .filter((v) => v > 0);
    const distinctSpacings = frequency(spacings);
    if (distinctSpacings.size > 8) {
      issues.push(
        buildIssue({
          category: 'visual',
          analyzerId: 'spacing',
          title: `Inconsistent spacing scale (${distinctSpacings.size} values)`,
          description: `${distinctSpacings.size} distinct spacing values are in use. Reduce to a small, predictable set of spacing tokens.`,
          severity: 'low',
          nodes: [],
        }),
      );
    }

    // 4) Misalignment — siblings that are almost-but-not-quite aligned.
    let misalignedCount = 0;
    const misalignedNodes: AuditNode[] = [];
    for (const container of containers) {
      const kids = container.children.filter((c) => c.visible);
      const lefts = kids.map((k) => k.x);
      for (let i = 0; i < lefts.length; i++) {
        for (let j = i + 1; j < lefts.length; j++) {
          const diff = Math.abs((lefts[i] ?? 0) - (lefts[j] ?? 0));
          if (diff > 0.2 && diff < 2) {
            misalignedCount += 1;
            const kidI = kids[i];
            const kidJ = kids[j];
            if (kidI) misalignedNodes.push(kidI);
            if (kidJ) misalignedNodes.push(kidJ);
          }
        }
      }
    }
    if (misalignedCount > 0) {
      issues.push(
        buildIssue({
          category: 'visual',
          analyzerId: 'spacing',
          title: `Sub-pixel misalignment (${misalignedCount} pairs)`,
          description: `Some sibling layers are misaligned by fractions of a pixel. This causes blurry edges — snap them to whole-pixel positions.`,
          severity: 'info',
          nodes: misalignedNodes.slice(0, 12),
        }),
      );
    }

    return makeResult(this, issues, recommendations, {
      autoLayoutAdoption: adoption,
      containers: containers.length,
      distinctSpacings: distinctSpacings.size,
    });
  },
};
