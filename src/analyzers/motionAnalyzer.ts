import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, makeResult } from './base';

/**
 * MotionAnalyzer — inspects prototype transitions for motion that may trigger
 * vestibular disorders or distraction. Contributes to "Motion".
 */
export const MotionAnalyzer: Analyzer = {
  id: 'motion',
  category: 'motion',
  title: 'Motion',
  icon: 'Waves',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    const animated: AuditNode[] = [];
    const largeMotion: AuditNode[] = [];
    const autoPlaying: AuditNode[] = [];

    for (const node of ctx.visibleNodes) {
      for (const r of node.reactions) {
        const animatedTransition =
          r.hasSmartAnimate ||
          (r.transitionType && r.transitionType !== 'INSTANT' && r.transitionType !== 'DISSOLVE');
        if (animatedTransition) animated.push(node);
        if (
          r.transitionType &&
          /MOVE_IN|MOVE_OUT|PUSH|SLIDE/.test(r.transitionType) &&
          (node.width > 320 || node.height > 320)
        ) {
          largeMotion.push(node);
        }
        if (r.trigger === 'AFTER_TIMEOUT') autoPlaying.push(node);
      }
    }

    const uniqueAnimated = [...new Set(animated)];
    const uniqueLarge = [...new Set(largeMotion)];
    const uniqueAuto = [...new Set(autoPlaying)];

    if (uniqueLarge.length > 0) {
      issues.push(
        buildIssue({
          category: 'motion',
          analyzerId: 'motion',
          title: `Large motion transitions (${uniqueLarge.length})`,
          description: `${uniqueLarge.length} large elements use move/slide/push transitions. Large-scale motion can trigger vestibular discomfort. Provide a reduced-motion alternative (fade or instant).`,
          severity: 'medium',
          wcag: '2.3.3 Animation from Interactions',
          wcagLevel: 'AAA',
          nodes: uniqueLarge.slice(0, 10),
        }),
      );
      recommendations.push('Offer a reduced-motion variant using fades instead of large movement.');
    }

    if (uniqueAuto.length > 0) {
      issues.push(
        buildIssue({
          category: 'motion',
          analyzerId: 'motion',
          title: `Auto-playing transitions (${uniqueAuto.length})`,
          description: `${uniqueAuto.length} elements animate automatically after a timeout. Auto-motion that lasts more than 5s must be pausable (WCAG 2.2.2).`,
          severity: 'low',
          wcag: '2.2.2 Pause, Stop, Hide',
          wcagLevel: 'A',
          nodes: uniqueAuto.slice(0, 10),
        }),
      );
      recommendations.push('Let users pause, stop, or hide auto-playing motion.');
    }

    if (uniqueAnimated.length > 0) {
      recommendations.push('Respect the OS "reduce motion" setting when implementing these animations.');
    }

    // No motion at all is perfectly fine — score stays high.
    return makeResult(this, issues, recommendations, {
      animatedCount: uniqueAnimated.length,
      largeMotionCount: uniqueLarge.length,
      autoPlayCount: uniqueAuto.length,
    });
  },
};
