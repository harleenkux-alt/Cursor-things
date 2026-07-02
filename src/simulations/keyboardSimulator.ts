import type { AnalyzerContext } from '@/analyzers/base';
import type { FocusStop, KeyboardResult, SimIssue } from '@/types/experience';
import { truncate } from '@/utils/text';
import { clampScore, simId } from './types';
import { inferRole, isInteractive, normBounds, sortByReadingOrder } from './nodeSemantics';

/**
 * KeyboardSimulator — derives a tab/focus order from interactive elements and
 * flags keyboard-accessibility problems (hover-only controls, tiny targets,
 * potential focus traps).
 */
export function runKeyboardSimulation(ctx: AnalyzerContext): KeyboardResult {
  const focusable = ctx.visibleNodes.filter(
    (n) => isInteractive(n) && n.width > 2 && n.height > 2,
  );
  const ordered = sortByReadingOrder(focusable);
  const issues: SimIssue[] = [];

  const stops: FocusStop[] = ordered.map((node, index) => {
    const problems: string[] = [];
    const hoverOnly =
      node.reactions.some((r) => r.trigger === 'ON_HOVER') &&
      !node.reactions.some((r) => r.trigger === 'ON_CLICK' || r.trigger === 'ON_PRESS');
    if (hoverOnly) problems.push('Hover-only — not reachable by keyboard.');
    if (node.width < 24 || node.height < 24)
      problems.push('Very small focus target.');
    return {
      order: index + 1,
      nodeId: node.id,
      name: truncate(node.name, 30),
      role: inferRole(node),
      bounds: normBounds(node, ctx.root),
      problems,
    };
  });

  if (focusable.length === 0) {
    issues.push({
      id: simId('kbd'),
      title: 'No keyboard-focusable elements detected',
      description:
        'No interactive elements were found. If this screen has controls, ensure they are real components with interactions so keyboard users can reach them.',
      status: 'warning',
      nodeIds: [],
      wcag: '2.1.1 Keyboard',
    });
  }

  const hoverOnlyStops = stops.filter((s) =>
    s.problems.some((p) => p.startsWith('Hover-only')),
  );
  if (hoverOnlyStops.length > 0) {
    issues.push({
      id: simId('kbd'),
      title: `${hoverOnlyStops.length} hover-only control(s)`,
      description:
        'Actions triggered only on hover cannot be operated with a keyboard. Provide equivalent focus/activate behavior.',
      status: 'fail',
      nodeIds: hoverOnlyStops.map((s) => s.nodeId),
      wcag: '2.1.1 Keyboard',
    });
  }

  // Focus trap heuristic: a dialog/modal without an obvious close/dismiss.
  const dialogs = ctx.visibleNodes.filter((n) => /dialog|modal|sheet|drawer/i.test(n.name));
  const hasDismiss = ctx.visibleNodes.some((n) => /close|dismiss|cancel|back|x\b/i.test(n.name));
  if (dialogs.length > 0 && !hasDismiss) {
    issues.push({
      id: simId('kbd'),
      title: 'Possible focus trap',
      description:
        'A dialog/modal is present but no clear close or dismiss control was found. Keyboard users could get trapped.',
      status: 'warning',
      nodeIds: dialogs.map((d) => d.id),
      wcag: '2.1.2 No Keyboard Trap',
    });
  }

  const score = clampScore(
    100 - hoverOnlyStops.length * 12 - stops.filter((s) => s.problems.length).length * 4 -
      (dialogs.length > 0 && !hasDismiss ? 10 : 0),
  );

  return { score, stops, issues };
}
