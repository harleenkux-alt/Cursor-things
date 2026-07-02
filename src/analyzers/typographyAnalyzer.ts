import type { AuditNode } from '@/models/auditNode';
import type { Issue } from '@/types/analysis';
import { average, frequency, standardDeviation, unique } from '@/utils/math';
import { readability } from '@/utils/text';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, looksLikeText, makeResult } from './base';

/** Line-height ratio (lineHeight / fontSize) considered comfortable for body text. */
const MIN_COMFORTABLE_LH = 1.3;
const LONG_PARAGRAPH_CHARS = 320;

function lineHeightPx(node: AuditNode): number | null {
  if (!node.text) return null;
  const { lineHeight, fontSize } = node.text;
  if (lineHeight.unit === 'AUTO') return fontSize * 1.2;
  if (lineHeight.unit === 'PIXELS') return lineHeight.value;
  return (lineHeight.value / 100) * fontSize;
}

/** Heuristic: does this text node look like a heading? */
function isHeading(node: AuditNode): boolean {
  if (!node.text) return false;
  const byName = /h[1-6]\b|heading|title|headline|display/i.test(node.name);
  const byStyle = node.text.fontSize >= 20 && node.text.fontWeight >= 600;
  return byName || byStyle;
}

export const TypographyAnalyzer: Analyzer = {
  id: 'typography',
  category: 'typography',
  title: 'Typography',
  icon: 'Type',

  analyze(ctx: AnalyzerContext) {
    const textNodes = ctx.visibleNodes.filter(looksLikeText);
    const issues: Issue[] = [];
    const recommendations: string[] = [];
    const minSize = ctx.settings.minFontSize;

    // 1) Small / illegible text.
    const smallText = textNodes.filter((n) => (n.text?.fontSize ?? 99) < minSize);
    for (const node of smallText) {
      const size = node.text!.fontSize;
      issues.push(
        buildIssue({
          category: 'typography',
          analyzerId: 'typography',
          title: `Text too small (${size}px)`,
          description: `"${node.text!.characters.slice(0, 40)}" is ${size}px, below the ${minSize}px minimum for readable body text.`,
          severity: size < 10 ? 'high' : 'medium',
          wcag: '1.4.4 Resize Text',
          wcagLevel: 'AA',
          nodes: [node],
          fix: {
            kind: 'setFontSize',
            label: 'Increase font size',
            current: `${size}px`,
            recommended: `${Math.max(minSize, 16)}px`,
            suggestedValue: String(Math.max(minSize, 16)),
            nodeId: node.id,
            autoFixable: true,
          },
        }),
      );
    }

    // 2) Tight line height.
    for (const node of textNodes) {
      const lh = lineHeightPx(node);
      const size = node.text!.fontSize;
      if (lh && size > 0 && lh / size < MIN_COMFORTABLE_LH && !isHeading(node)) {
        const ratio = Math.round((lh / size) * 100) / 100;
        issues.push(
          buildIssue({
            category: 'typography',
            analyzerId: 'typography',
            title: `Tight line height (${ratio}×)`,
            description: `Body text "${node.text!.characters.slice(0, 30)}" has a line-height ratio of ${ratio}. Aim for 1.4–1.6× for comfortable reading.`,
            severity: 'low',
            wcag: '1.4.12 Text Spacing',
            wcagLevel: 'AA',
            nodes: [node],
            fix: {
              kind: 'setLineHeight',
              label: 'Increase line height',
              current: `${ratio}×`,
              recommended: '1.5×',
              suggestedValue: '150',
              nodeId: node.id,
              autoFixable: true,
            },
          }),
        );
      }
    }

    // 3) Long paragraphs / reading complexity.
    for (const node of textNodes) {
      const chars = node.text!.characters;
      if (chars.length >= LONG_PARAGRAPH_CHARS) {
        const r = readability(chars);
        const complex = r.fleschReadingEase < 50;
        issues.push(
          buildIssue({
            category: 'typography',
            analyzerId: 'typography',
            title: complex
              ? `Long, complex paragraph (grade ${r.fleschKincaidGrade})`
              : 'Long paragraph',
            description: `A ${chars.length}-character block (${r.words} words). ${complex ? `Reading difficulty is "${r.label}".` : ''} Break it into shorter paragraphs and keep line length near 45–75 characters.`,
            severity: complex ? 'medium' : 'low',
            nodes: [node],
          }),
        );
      }
    }

    // 4) Heading hierarchy / duplicate heading styles.
    const headings = textNodes.filter(isHeading);
    const headingSizes = headings.map((h) => h.text!.fontSize);
    const sizeGroups = frequency(headingSizes);
    if (sizeGroups.size === 1 && headings.length > 2) {
      issues.push(
        buildIssue({
          category: 'typography',
          analyzerId: 'typography',
          title: 'Flat heading hierarchy',
          description: `All ${headings.length} headings share the same size. Visual hierarchy helps users scan content — differentiate levels with size and weight.`,
          severity: 'medium',
          wcag: '1.3.1 Info and Relationships',
          wcagLevel: 'A',
          nodes: headings.slice(0, 12),
        }),
      );
    }

    // Too many distinct type styles = inconsistent system.
    const styleKeys = textNodes.map(
      (n) => `${n.text!.fontFamily}/${n.text!.fontSize}/${n.text!.fontWeight}`,
    );
    const distinctStyles = unique(styleKeys).length;
    if (distinctStyles > 12) {
      issues.push(
        buildIssue({
          category: 'typography',
          analyzerId: 'typography',
          title: `Too many text styles (${distinctStyles})`,
          description: `Detected ${distinctStyles} distinct text styles. Consolidate into a documented type scale (e.g. display, h1–h3, body, caption).`,
          severity: 'low',
          nodes: [],
        }),
      );
    }

    // Typography Health Score derived from consistency + legibility signals.
    const sizes = textNodes.map((n) => n.text!.fontSize);
    const sizeConsistency = sizes.length > 1 ? standardDeviation(sizes) : 0;
    const bodySizes = textNodes
      .filter((n) => !isHeading(n))
      .map((n) => n.text!.fontSize);
    const avgBody = Math.round(average(bodySizes) * 10) / 10;

    if (smallText.length > 0) {
      recommendations.push(`Raise ${smallText.length} small text layer(s) to at least ${minSize}px.`);
    }
    if (distinctStyles > 12) {
      recommendations.push('Adopt a fixed type scale and map every text layer to a style.');
    }
    recommendations.push('Keep body copy at 16px+ with 1.5× line height for comfortable reading.');

    return makeResult(this, issues, recommendations, {
      textNodeCount: textNodes.length,
      distinctStyles,
      averageBodySize: Number.isFinite(avgBody) ? avgBody : 0,
      sizeConsistency: Math.round(sizeConsistency * 10) / 10,
      headingCount: headings.length,
    });
  },
};
