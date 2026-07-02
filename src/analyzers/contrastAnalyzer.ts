import { contrastRatio, rgbToHex, suggestAccessibleColor } from '@/utils/color';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, isLargeText, looksLikeText, makeResult } from './base';
import { effectiveBackground, firstSolidFill, resolvedForeground } from './shared';
import type { Issue } from '@/types/analysis';

/**
 * ContrastAnalyzer — WCAG 1.4.3 / 1.4.6 text contrast + 1.4.11 non-text
 * contrast for interactive UI boundaries.
 */
export const ContrastAnalyzer: Analyzer = {
  id: 'contrast',
  category: 'color',
  title: 'Contrast',
  icon: 'Contrast',

  analyze(ctx: AnalyzerContext) {
    const issues: Issue[] = [];
    const target = ctx.settings.conformanceTarget;
    let checked = 0;
    let passed = 0;

    for (const node of ctx.visibleNodes) {
      if (!looksLikeText(node) || !node.text) continue;
      const fg = resolvedForeground(ctx, node);
      if (!fg) continue;
      const bg = effectiveBackground(ctx, node);
      const ratio = contrastRatio(fg, bg);
      const large = isLargeText(node.text.fontSize, node.text.fontWeight);
      const required = large ? (target === 'AAA' ? 4.5 : 3) : target === 'AAA' ? 7 : 4.5;
      checked += 1;

      if (ratio >= required) {
        passed += 1;
        continue;
      }

      const severity = ratio < 3 ? 'critical' : ratio < required - 1 ? 'high' : 'medium';
      const suggested = suggestAccessibleColor(fg, bg, required);
      issues.push(
        buildIssue({
          category: 'color',
          analyzerId: 'contrast',
          title: `Low text contrast (${ratio}:1)`,
          description: `"${node.text.characters.slice(0, 40)}" has a contrast ratio of ${ratio}:1 against its background (${rgbToHex(bg)}). WCAG ${target} requires at least ${required}:1 for this text size.`,
          severity,
          wcag: '1.4.3 Contrast (Minimum)',
          wcagLevel: target === 'AAA' ? 'AAA' : 'AA',
          nodes: [node],
          fix: {
            kind: 'setTextColor',
            label: 'Increase contrast',
            current: `${ratio}:1 (${rgbToHex(fg)})`,
            recommended: `${required}:1`,
            suggestedValue: suggested,
            nodeId: node.id,
            autoFixable: true,
          },
        }),
      );
    }

    // Non-text contrast for interactive elements with a border only.
    for (const node of ctx.visibleNodes) {
      if (node.type !== 'INSTANCE' && !/button|input|field|card/i.test(node.name)) continue;
      const stroke = node.strokes.find((s) => s.type === 'SOLID');
      const hasFill = firstSolidFill(node);
      if (!stroke || hasFill) continue;
      const bg = effectiveBackground(ctx, node);
      const strokeRgb = resolvedForeground(ctx, { ...node, fills: [stroke] });
      if (!strokeRgb) continue;
      const ratio = contrastRatio(strokeRgb, bg);
      if (ratio < 3) {
        issues.push(
          buildIssue({
            category: 'color',
            analyzerId: 'contrast',
            title: `Low UI border contrast (${ratio}:1)`,
            description: `The boundary of "${node.name}" has ${ratio}:1 contrast. Interactive component boundaries need 3:1 (WCAG 1.4.11).`,
            severity: 'medium',
            wcag: '1.4.11 Non-text Contrast',
            wcagLevel: 'AA',
            nodes: [node],
          }),
        );
      }
    }

    const recommendations: string[] = [];
    if (issues.length > 0) {
      recommendations.push(
        'Darken or lighten text colors until they meet the required ratio — use the suggested colors as a starting point.',
      );
      recommendations.push(
        'Prefer solid backgrounds behind text; gradients and images make contrast unpredictable.',
      );
    }

    const passRate = checked > 0 ? Math.round((passed / checked) * 100) : 100;
    return makeResult(this, issues, recommendations, {
      checked,
      passed,
      passRate,
    });
  },
};
