import type { AnalyzerContext } from '@/analyzers/base';
import { isTouchTargetCandidate } from '@/analyzers/base';
import type { MotorResult, MotorTarget, SimIssue, SimStatus } from '@/types/experience';
import { truncate } from '@/utils/text';
import { round } from '@/utils/math';
import { clampScore, simId } from './types';

/**
 * MotorAnalyzer — evaluates the interface for motor accessibility: touch target
 * size, spacing between controls, and reliance on complex gestures (drag,
 * hover, double-tap, long-press).
 */
export function runMotorAnalysis(ctx: AnalyzerContext): MotorResult {
  const min = ctx.settings.minTouchTarget;
  const candidates = ctx.visibleNodes.filter(isTouchTargetCandidate);

  const targets: MotorTarget[] = candidates.map((node) => {
    const tooSmall = node.width < min || node.height < min;
    const critical = node.width < 24 || node.height < 24;
    const status: SimStatus = critical ? 'fail' : tooSmall ? 'warning' : 'pass';
    return {
      nodeId: node.id,
      name: truncate(node.name, 28),
      width: round(node.width),
      height: round(node.height),
      status,
      reason: tooSmall
        ? `Below the ${min}×${min}px minimum target size`
        : 'Meets minimum target size',
    };
  });

  // Spacing between adjacent interactive siblings.
  const gestureIssues: SimIssue[] = [];
  const closePairs: string[] = [];
  for (const parent of ctx.visibleNodes) {
    const kids = parent.children.filter(isTouchTargetCandidate);
    for (let i = 0; i < kids.length; i++) {
      for (let j = i + 1; j < kids.length; j++) {
        const a = kids[i]!;
        const b = kids[j]!;
        const gap = rectGap(a, b);
        if (gap >= 0 && gap < 8) {
          closePairs.push(a.id, b.id);
        }
      }
    }
  }
  if (closePairs.length > 0) {
    gestureIssues.push({
      id: simId('motor'),
      title: 'Controls placed too close together',
      description:
        'Interactive elements are less than 8px apart, which makes them hard to target accurately and increases mis-taps.',
      status: 'warning',
      nodeIds: [...new Set(closePairs)].slice(0, 20),
      wcag: '2.5.8 Target Size (Minimum)',
    });
  }

  // Gesture reliance (heuristic via names + reactions).
  const dragOnly = candidates.filter((n) => /drag|slider|swipe|reorder/i.test(n.name));
  const hoverOnly = candidates.filter(
    (n) =>
      n.reactions.some((r) => r.trigger === 'ON_HOVER') &&
      !n.reactions.some((r) => r.trigger === 'ON_CLICK' || r.trigger === 'ON_PRESS'),
  );
  const complexGesture = candidates.filter((n) =>
    /double\s?tap|long\s?press|pinch|two\s?finger/i.test(n.name),
  );

  pushGesture(gestureIssues, dragOnly, 'Drag-only interaction', '2.5.7 Dragging Movements');
  pushGesture(gestureIssues, hoverOnly, 'Hover-only interaction', '2.1.1 Keyboard');
  pushGesture(
    gestureIssues,
    complexGesture,
    'Complex gesture required',
    '2.5.1 Pointer Gestures',
  );

  const fails = targets.filter((t) => t.status === 'fail').length;
  const warns = targets.filter((t) => t.status === 'warning').length;
  const score = clampScore(
    100 - fails * 12 - warns * 5 - gestureIssues.length * 6,
  );

  const recommendations: string[] = [];
  if (fails + warns > 0)
    recommendations.push(`Enlarge ${fails + warns} control(s) to at least ${min}×${min}px.`);
  if (closePairs.length > 0)
    recommendations.push('Add at least 8px spacing between adjacent controls.');
  if (dragOnly.length + complexGesture.length > 0)
    recommendations.push('Offer a simple single-tap alternative to every complex gesture.');
  if (hoverOnly.length > 0)
    recommendations.push('Ensure hover actions are also available on tap/click and keyboard.');

  return { score, targets, gestureIssues, recommendations };

  function pushGesture(
    into: SimIssue[],
    nodes: typeof candidates,
    title: string,
    wcag: string,
  ) {
    if (nodes.length === 0) return;
    into.push({
      id: simId('motor'),
      title,
      description: `${nodes.length} element(s) appear to rely on "${title.toLowerCase()}". Provide an accessible, low-dexterity alternative.`,
      status: 'warning',
      nodeIds: nodes.map((n) => n.id).slice(0, 20),
      wcag,
    });
  }
}

function rectGap(a: { x: number; y: number; width: number; height: number }, b: typeof a): number {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  const overlapX = a.x < bx2 && b.x < ax2;
  const overlapY = a.y < by2 && b.y < ay2;
  if (overlapX && overlapY) return -1; // overlapping
  const dx = overlapX ? 0 : Math.min(Math.abs(b.x - ax2), Math.abs(a.x - bx2));
  const dy = overlapY ? 0 : Math.min(Math.abs(b.y - ay2), Math.abs(a.y - by2));
  return Math.hypot(dx, dy);
}
