import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import { round } from '@/utils/math';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, isTouchTargetCandidate, makeResult } from './base';

type ComponentKind =
  | 'button'
  | 'input'
  | 'checkbox'
  | 'card'
  | 'icon'
  | 'image'
  | 'list'
  | 'menu'
  | 'navigation'
  | 'dialog';

const KIND_PATTERNS: Array<[ComponentKind, RegExp]> = [
  ['button', /button|btn|cta|fab/i],
  ['input', /input|field|textbox|textarea|search|form\s?control/i],
  ['checkbox', /checkbox|radio|toggle|switch/i],
  ['card', /card|tile|panel/i],
  ['icon', /icon|glyph/i],
  ['image', /image|img|photo|avatar|thumbnail/i],
  ['list', /list|table|row|grid\s?item/i],
  ['menu', /menu|dropdown|popover|select/i],
  ['navigation', /nav|tabbar|navbar|breadcrumb|sidebar/i],
  ['dialog', /dialog|modal|sheet|drawer|alert/i],
];

function detectKind(node: AuditNode): ComponentKind | null {
  const name = node.name;
  for (const [kind, pattern] of KIND_PATTERNS) {
    if (pattern.test(name)) return kind;
  }
  if (node.hasImageFill) return 'image';
  return null;
}

/**
 * ComponentAnalyzer — detects UI components, measures touch targets, and flags
 * inconsistency across similar components. Contributes to "Components".
 */
export const ComponentAnalyzer: Analyzer = {
  id: 'components',
  category: 'components',
  title: 'Components',
  icon: 'Component',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];
    const minTarget = ctx.settings.minTouchTarget;

    const detected = new Map<ComponentKind, AuditNode[]>();
    for (const node of ctx.visibleNodes) {
      const kind = detectKind(node);
      if (!kind) continue;
      const list = detected.get(kind) ?? [];
      list.push(node);
      detected.set(kind, list);
    }

    // 1) Touch targets below the minimum.
    const smallTargets: AuditNode[] = [];
    for (const node of ctx.visibleNodes) {
      if (!isTouchTargetCandidate(node)) continue;
      if (node.width < minTarget || node.height < minTarget) {
        smallTargets.push(node);
      }
    }
    for (const node of smallTargets.slice(0, 25)) {
      issues.push(
        buildIssue({
          category: 'components',
          analyzerId: 'components',
          title: `Touch target too small (${round(node.width)}×${round(node.height)})`,
          description: `"${node.name}" is smaller than the ${minTarget}×${minTarget}px minimum recommended for reliable tapping.`,
          severity: node.width < 24 || node.height < 24 ? 'high' : 'medium',
          wcag: '2.5.8 Target Size (Minimum)',
          wcagLevel: 'AA',
          nodes: [node],
          fix: {
            kind: 'resize',
            label: 'Enlarge touch target',
            current: `${round(node.width)}×${round(node.height)}px`,
            recommended: `${minTarget}×${minTarget}px`,
            nodeId: node.id,
            autoFixable: false,
          },
        }),
      );
    }
    if (smallTargets.length > 0) {
      recommendations.push(
        `Ensure interactive elements are at least ${minTarget}×${minTarget}px (add padding rather than scaling icons).`,
      );
    }

    // 2) Inconsistent buttons (varied heights).
    const buttons = detected.get('button') ?? [];
    if (buttons.length >= 3) {
      const heights = buttons.map((b) => round(b.height));
      const uniqueHeights = [...new Set(heights)];
      if (uniqueHeights.length > 3) {
        issues.push(
          buildIssue({
            category: 'components',
            analyzerId: 'components',
            title: `Inconsistent button sizing (${uniqueHeights.length} heights)`,
            description: `Buttons appear in ${uniqueHeights.length} different heights (${uniqueHeights
              .slice(0, 5)
              .join(', ')}px). Standardize on a small set of button sizes.`,
            severity: 'low',
            nodes: buttons.slice(0, 12),
          }),
        );
        recommendations.push('Standardize button heights via a shared component.');
      }
    }

    // 3) Detached components — raw frames that look like components but aren't instances.
    const looksLikeComponent = ctx.visibleNodes.filter(
      (n) =>
        !n.isComponentInstance &&
        (n.type === 'FRAME' || n.type === 'GROUP') &&
        /button|input|card|badge|chip/i.test(n.name),
    );
    if (looksLikeComponent.length > 6) {
      issues.push(
        buildIssue({
          category: 'components',
          analyzerId: 'components',
          title: `Detached UI elements (${looksLikeComponent.length})`,
          description: `${looksLikeComponent.length} elements look like components but aren't instances. Using shared components keeps behavior and accessibility consistent.`,
          severity: 'info',
          nodes: looksLikeComponent.slice(0, 12),
        }),
      );
    }

    const inventory: Record<string, number> = {};
    for (const [kind, list] of detected) inventory[kind] = list.length;

    return makeResult(this, issues, recommendations, {
      inventory,
      smallTargetCount: smallTargets.length,
      buttonCount: buttons.length,
    });
  },
};
