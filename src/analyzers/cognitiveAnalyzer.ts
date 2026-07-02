import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, looksLikeText, makeResult } from './base';

const MAX_PRIMARY_ACTIONS = 2;
const MAX_FORM_FIELDS = 8;
const INFO_OVERLOAD_ACTIONS = 12;

function countMatching(nodes: AuditNode[], pattern: RegExp): AuditNode[] {
  return nodes.filter((n) => pattern.test(n.name));
}

/**
 * CognitiveAnalyzer — measures decision load and information density to catch
 * cognitive-accessibility problems. Contributes to "Cognitive Accessibility".
 */
export const CognitiveAnalyzer: Analyzer = {
  id: 'cognitive',
  category: 'cognitive',
  title: 'Cognitive Load',
  icon: 'Brain',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const recommendations: string[] = [];
    const nodes = ctx.visibleNodes;

    const buttons = countMatching(nodes, /button|btn|cta/i);
    const primaryButtons = countMatching(nodes, /primary|cta|submit|continue|confirm|next|save/i).filter(
      (n) => /button|btn|cta/i.test(n.name),
    );
    const inputs = countMatching(nodes, /input|field|textbox|textarea|select|dropdown/i);
    const alerts = countMatching(nodes, /alert|error|warning|banner|toast|notification|badge/i);
    const menus = countMatching(nodes, /menu|dropdown|nav|tab/i);

    // Total interactive "decisions".
    const totalActions = new Set([...buttons, ...inputs, ...menus].map((n) => n.id)).size;

    // 1) Too many primary actions.
    if (primaryButtons.length > MAX_PRIMARY_ACTIONS) {
      issues.push(
        buildIssue({
          category: 'cognitive',
          analyzerId: 'cognitive',
          title: `Too many primary actions (${primaryButtons.length})`,
          description: `${primaryButtons.length} buttons compete as the primary action. Limit each screen to one clear primary action so users know what to do next.`,
          severity: 'medium',
          nodes: primaryButtons.slice(0, 10),
        }),
      );
      recommendations.push('Keep one primary action per screen; demote the rest to secondary styles.');
    }

    // 2) Long forms.
    if (inputs.length > MAX_FORM_FIELDS) {
      issues.push(
        buildIssue({
          category: 'cognitive',
          analyzerId: 'cognitive',
          title: `Long form (${inputs.length} fields)`,
          description: `This screen has ${inputs.length} input fields. Long forms increase abandonment. Split into steps or remove optional fields.`,
          severity: 'medium',
          nodes: inputs.slice(0, 12),
        }),
      );
      recommendations.push('Break long forms into logical steps and defer optional questions.');
    }

    // 3) Too many alerts / notifications.
    if (alerts.length > 4) {
      issues.push(
        buildIssue({
          category: 'cognitive',
          analyzerId: 'cognitive',
          title: `Alert overload (${alerts.length})`,
          description: `${alerts.length} alert/notification elements are visible at once. Competing alerts dilute urgency — show only what's essential.`,
          severity: 'low',
          nodes: alerts.slice(0, 10),
        }),
      );
    }

    // 4) Information overload — sheer number of decisions.
    if (totalActions > INFO_OVERLOAD_ACTIONS) {
      issues.push(
        buildIssue({
          category: 'cognitive',
          analyzerId: 'cognitive',
          title: `High interaction density (${totalActions} actions)`,
          description: `${totalActions} interactive elements are present. Dense screens overwhelm users, especially those with cognitive disabilities. Group, prioritize, or progressively disclose.`,
          severity: 'medium',
          nodes: [],
        }),
      );
      recommendations.push('Reduce simultaneous choices with grouping and progressive disclosure.');
    }

    // 5) Text density — total on-screen words relative to area.
    const textNodes = nodes.filter(looksLikeText);
    const totalWords = textNodes.reduce(
      (sum, n) => sum + n.text!.characters.trim().split(/\s+/).filter(Boolean).length,
      0,
    );
    const areaK = Math.max(1, (ctx.root.width * ctx.root.height) / 1000);
    const density = totalWords / areaK; // words per 1000px²
    if (density > 0.6 && totalWords > 220) {
      issues.push(
        buildIssue({
          category: 'cognitive',
          analyzerId: 'cognitive',
          title: 'High text density',
          description: `The screen packs ${totalWords} words into a dense layout. Add whitespace and trim copy so the content is scannable.`,
          severity: 'low',
          nodes: [],
        }),
      );
    }

    return makeResult(this, issues, recommendations, {
      totalActions,
      buttons: buttons.length,
      primaryButtons: primaryButtons.length,
      inputs: inputs.length,
      alerts: alerts.length,
      totalWords,
    });
  },
};
