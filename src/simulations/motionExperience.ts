import type { AnalyzerContext } from '@/analyzers/base';
import type {
  MotionExperienceItem,
  MotionExperienceResult,
  SimStatus,
} from '@/types/experience';
import { truncate } from '@/utils/text';
import { clampScore } from './types';

/**
 * MotionExperience — flags motion that may cause vestibular discomfort,
 * distraction, or seizures, and recommends reduced-motion alternatives.
 */
export function runMotionExperience(ctx: AnalyzerContext): MotionExperienceResult {
  const items: MotionExperienceItem[] = [];
  const seen = new Set<string>();

  const add = (
    nodeId: string,
    name: string,
    kind: string,
    status: SimStatus,
    recommendation: string,
  ) => {
    const key = `${nodeId}:${kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ nodeId, name: truncate(name, 28), kind, status, recommendation });
  };

  for (const node of ctx.visibleNodes) {
    const name = node.name.toLowerCase();

    if (/parallax/.test(name))
      add(node.id, node.name, 'Parallax', 'warning', 'Disable parallax when reduce-motion is set.');
    if (/flash|blink|strobe/.test(name))
      add(node.id, node.name, 'Flashing element', 'fail', 'Avoid flashing >3×/sec (seizure risk, WCAG 2.3.1).');
    if (/loop|infinite|spinner|loading/.test(name))
      add(node.id, node.name, 'Looping animation', 'warning', 'Allow infinite loops to be paused/stopped.');
    if (/video|autoplay/.test(name))
      add(node.id, node.name, 'Auto-playing media', 'warning', 'Do not autoplay; provide play/pause controls.');

    for (const r of node.reactions) {
      const t = r.transitionType ?? '';
      if (r.hasSmartAnimate || /MOVE_IN|MOVE_OUT|PUSH|SLIDE|SMART_ANIMATE/.test(t)) {
        const large = node.width > 320 || node.height > 320;
        add(
          node.id,
          node.name,
          large ? 'Large transition' : 'Animated transition',
          large ? 'warning' : 'pass',
          large
            ? 'Provide a fade/instant alternative for reduce-motion users.'
            : 'Respect the OS reduce-motion setting.',
        );
      }
      if (r.trigger === 'AFTER_TIMEOUT') {
        add(node.id, node.name, 'Auto-advancing', 'warning', 'Let users pause auto-advancing content.');
      }
    }
  }

  const fails = items.filter((i) => i.status === 'fail').length;
  const warns = items.filter((i) => i.status === 'warning').length;
  const score = clampScore(100 - fails * 25 - warns * 8);

  const recommendations: string[] = [];
  if (items.some((i) => i.kind === 'Flashing element'))
    recommendations.push('Remove or throttle flashing to prevent seizures (WCAG 2.3.1).');
  if (warns > 0) recommendations.push('Honor prefers-reduced-motion and offer subtle alternatives.');
  if (items.some((i) => i.kind === 'Auto-playing media'))
    recommendations.push('Never autoplay motion or media without user control.');
  if (items.length === 0) recommendations.push('No risky motion detected — keep motion purposeful and optional.');

  return { score, items, recommendations };
}
