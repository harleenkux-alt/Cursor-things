import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import { looksLikeText } from './base';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, makeResult } from './base';

function isIconOnlyButton(node: AuditNode): boolean {
  const looksInteractive = /button|btn|icon|action|fab/i.test(node.name) || node.reactions.length > 0;
  if (!looksInteractive) return false;
  const hasVisibleText = descendantText(node).length > 0;
  const smallish = node.width <= 64 && node.height <= 64;
  return !hasVisibleText && smallish;
}

function descendantText(node: AuditNode): AuditNode[] {
  const out: AuditNode[] = [];
  const walk = (n: AuditNode) => {
    if (looksLikeText(n)) out.push(n);
    n.children.forEach(walk);
  };
  node.children.forEach(walk);
  if (looksLikeText(node)) out.push(node);
  return out;
}

/**
 * InteractionAnalyzer — labels on interactive elements, focus/hover states,
 * disabled contrast, and clickable area. Contributes to "Interaction".
 */
export const InteractionAnalyzer: Analyzer = {
  id: 'interaction',
  category: 'interaction',
  title: 'Interaction',
  icon: 'MousePointerClick',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    const interactive = ctx.visibleNodes.filter(
      (n) =>
        n.reactions.length > 0 ||
        /button|btn|link|cta|tab|menu\s?item|nav/i.test(n.name),
    );

    // 1) Icon-only buttons without an accessible label.
    const iconOnly = ctx.visibleNodes.filter(isIconOnlyButton);
    for (const node of iconOnly.slice(0, 25)) {
      const hasNamedLabel = /[a-z].*(button|close|menu|search|back|next|settings|add|delete|edit|share)/i.test(
        node.name,
      );
      issues.push(
        buildIssue({
          category: 'interaction',
          analyzerId: 'interaction',
          title: 'Icon-only control without visible label',
          description: `"${node.name}" appears to be an icon-only control. ${hasNamedLabel ? 'Ensure it exposes an accessible name to screen readers.' : 'Add a visible or accessible label so its purpose is clear.'}`,
          severity: hasNamedLabel ? 'low' : 'medium',
          wcag: '4.1.2 Name, Role, Value',
          wcagLevel: 'A',
          nodes: [node],
        }),
      );
    }
    if (iconOnly.length > 0) {
      recommendations.push('Give icon-only controls a text label or an accessible name.');
    }

    // 2) Buttons with no label at all (no text descendant, larger than icon).
    const unlabeledButtons = interactive.filter(
      (n) =>
        /button|btn|cta/i.test(n.name) &&
        descendantText(n).length === 0 &&
        !isIconOnlyButton(n),
    );
    for (const node of unlabeledButtons.slice(0, 15)) {
      issues.push(
        buildIssue({
          category: 'interaction',
          analyzerId: 'interaction',
          title: 'Button without a text label',
          description: `"${node.name}" looks like a button but contains no text. Buttons should have clear, descriptive labels.`,
          severity: 'high',
          wcag: '2.4.6 Headings and Labels',
          wcagLevel: 'AA',
          nodes: [node],
        }),
      );
    }

    // 3) Missing interactive/hover state coverage.
    const withReactions = interactive.filter((n) => n.reactions.length > 0);
    const hasHover = interactive.some((n) =>
      n.reactions.some((r) => r.trigger === 'ON_HOVER'),
    );
    if (interactive.length >= 4 && withReactions.length === 0) {
      issues.push(
        buildIssue({
          category: 'interaction',
          analyzerId: 'interaction',
          title: 'No prototype interactions detected',
          description: `${interactive.length} elements look interactive but none have prototype connections. Interactive states (hover, focus, pressed) help communicate affordance and support keyboard users.`,
          severity: 'info',
          nodes: interactive.slice(0, 10),
        }),
      );
      recommendations.push('Prototype hover, focus, and pressed states for interactive elements.');
    } else if (interactive.length >= 6 && !hasHover) {
      recommendations.push('Add explicit focus indicators for keyboard navigation (WCAG 2.4.7).');
    }

    // 4) Disabled-looking elements with very low opacity (hard to perceive).
    const faded = interactive.filter((n) => n.opacity > 0 && n.opacity < 0.4);
    for (const node of faded.slice(0, 10)) {
      issues.push(
        buildIssue({
          category: 'interaction',
          analyzerId: 'interaction',
          title: `Very faint interactive element (${Math.round(node.opacity * 100)}%)`,
          description: `"${node.name}" is rendered at ${Math.round(node.opacity * 100)}% opacity. Even disabled states should remain perceivable; avoid extreme transparency.`,
          severity: 'low',
          nodes: [node],
        }),
      );
    }

    return makeResult(this, issues, recommendations, {
      interactiveCount: interactive.length,
      iconOnlyCount: iconOnly.length,
      withReactions: withReactions.length,
      hasHover,
    });
  },
};
