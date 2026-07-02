import type { AnalyzerContext } from '@/analyzers/base';
import type {
  ReadingOrderItem,
  ScreenReaderResult,
  SimIssue,
} from '@/types/experience';
import { truncate } from '@/utils/text';
import { clampScore, simId } from './types';
import {
  accessibleName,
  inferRole,
  isMeaningful,
  normBounds,
  sortByReadingOrder,
} from './nodeSemantics';

const GENERIC_NAME = /^(frame|group|rectangle|vector|ellipse|image|img|icon|component)\s*\d*$/i;

/**
 * ScreenReaderSimulator — produces a simulated reading order and, for each
 * element, an inferred role + accessible name, flagging elements a screen
 * reader user would struggle with (unlabeled images, generic names, etc.).
 */
export function runScreenReaderSimulation(ctx: AnalyzerContext): ScreenReaderResult {
  const meaningful = ctx.visibleNodes.filter(
    (n) => isMeaningful(n) && n.width > 2 && n.height > 2,
  );
  const ordered = sortByReadingOrder(meaningful);

  const problems: SimIssue[] = [];
  const items: ReadingOrderItem[] = ordered.map((node, index) => {
    const role = inferRole(node);
    const name = accessibleName(node);
    const itemProblems: string[] = [];

    if ((role === 'img' || role === 'button' || role === 'link') &&
        (GENERIC_NAME.test(name.trim()) || !name.trim())) {
      itemProblems.push('No accessible name — screen readers will announce it generically.');
    }
    if (role === 'button' && node.type !== 'TEXT') {
      const hasText = hasChildText(node);
      if (!hasText && GENERIC_NAME.test(name.trim())) {
        itemProblems.push('Icon-only control with no label.');
      }
    }
    if (role === 'textbox') {
      itemProblems.push('Confirm this field has a programmatically associated label.');
    }

    return {
      order: index + 1,
      nodeId: node.id,
      role,
      accessibleName: truncate(name, 40),
      text: node.text ? truncate(node.text.characters, 60) : '',
      problems: itemProblems,
      bounds: normBounds(node, ctx.root),
    };
  });

  // Landmark / heading structure checks.
  const headings = items.filter((i) => i.role === 'heading');
  if (headings.length === 0 && items.length > 4) {
    problems.push({
      id: simId('sr'),
      title: 'No headings for navigation',
      description:
        'Screen reader users navigate by headings. This screen exposes none, forcing linear reading of everything.',
      status: 'fail',
      nodeIds: [],
      wcag: '1.3.1 Info and Relationships',
    });
  }
  const unlabeled = items.filter((i) => i.problems.length > 0);
  if (unlabeled.length > 0) {
    problems.push({
      id: simId('sr'),
      title: `${unlabeled.length} element(s) missing an accessible name`,
      description:
        'Elements without a meaningful name are announced as “button”, “image”, etc., giving the user no context.',
      status: unlabeled.length > 3 ? 'fail' : 'warning',
      nodeIds: unlabeled.map((i) => i.nodeId).slice(0, 20),
      wcag: '4.1.2 Name, Role, Value',
    });
  }

  const score = clampScore(
    100 - unlabeled.length * 6 - (headings.length === 0 && items.length > 4 ? 20 : 0),
  );

  return { score, items, problems };
}

function hasChildText(node: { children: { type: string; text?: unknown }[] }): boolean {
  return node.children.some(
    (c) => (c.type === 'TEXT' && c.text) || hasChildText(c as never),
  );
}
