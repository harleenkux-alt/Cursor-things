import type { AuditNode } from '@/models/auditNode';
import {
  BLACK,
  colorDistance,
  contrastRatio,
  figmaToHex,
  figmaToRgb,
  rateContrast,
  suggestAccessibleColor,
  WHITE,
  type RGB,
} from '@/utils/color';
import type {
  ColorEntry,
  ColorInventory,
  ColorNeighbor,
  ColorRole,
  Issue,
} from '@/types/analysis';
import type { Analyzer, AnalyzerContext } from './base';
import { buildIssue, makeResult } from './base';

/** Threshold under which two colors are considered "the same" (near-duplicate). */
const DUPLICATE_DISTANCE = 12;
/** Above this many distinct colors we flag palette bloat. */
const TOO_MANY_COLORS = 20;

interface ColorUsage {
  hex: string;
  rgb: RGB;
  count: number;
  asText: number;
  asFill: number;
  asStroke: number;
  names: Set<string>;
}

function classifyRole(usage: ColorUsage): ColorRole {
  const name = [...usage.names].join(' ').toLowerCase();
  if (/error|danger|success|warn|info|alert|valid|invalid/.test(name)) return 'semantic';
  if (usage.asStroke > usage.asFill && usage.asStroke > usage.asText) return 'border';
  if (usage.asText > usage.asFill) return 'text';
  if (/background|bg|backdrop|page/.test(name)) return 'background';
  if (/surface|card|sheet|panel|modal/.test(name)) return 'surface';
  if (/border|divider|outline|stroke/.test(name)) return 'border';
  if (/primary|brand|accent|cta|button/.test(name)) return 'primary';
  if (/secondary/.test(name)) return 'secondary';
  const { r, g, b } = usage.rgb;
  const isGrayish = Math.max(r, g, b) - Math.min(r, g, b) < 18;
  if (isGrayish) return 'neutral';
  return 'primary';
}

function ratingFor(rgb: RGB): ColorEntry['rating'] {
  const best = Math.max(contrastRatio(rgb, WHITE), contrastRatio(rgb, BLACK));
  return rateContrast(best, false);
}

function collectUsage(nodes: AuditNode[]): Map<string, ColorUsage> {
  const map = new Map<string, ColorUsage>();
  const add = (
    hex: string,
    rgb: RGB,
    name: string,
    kind: 'text' | 'fill' | 'stroke',
  ) => {
    let usage = map.get(hex);
    if (!usage) {
      usage = { hex, rgb, count: 0, asText: 0, asFill: 0, asStroke: 0, names: new Set() };
      map.set(hex, usage);
    }
    usage.count += 1;
    if (kind === 'text') usage.asText += 1;
    else if (kind === 'fill') usage.asFill += 1;
    else usage.asStroke += 1;
    if (usage.names.size < 8) usage.names.add(name);
  };

  for (const node of nodes) {
    if (!node.visible) continue;
    for (const fill of node.fills) {
      if (fill.type !== 'SOLID' || fill.color.a < 0.05) continue;
      const rgb = figmaToRgb(fill.color);
      add(figmaToHex(fill.color), rgb, node.name, node.type === 'TEXT' ? 'text' : 'fill');
    }
    for (const stroke of node.strokes) {
      if (stroke.type !== 'SOLID' || stroke.color.a < 0.05) continue;
      add(figmaToHex(stroke.color), figmaToRgb(stroke.color), node.name, 'stroke');
    }
  }
  return map;
}

export function buildColorInventory(nodes: AuditNode[]): ColorInventory {
  const usageMap = collectUsage(nodes);
  const usages = [...usageMap.values()].sort((a, b) => b.count - a.count);

  // Near-duplicate grouping.
  const duplicateGroups: string[][] = [];
  const consumed = new Set<string>();
  for (let i = 0; i < usages.length; i++) {
    const a = usages[i];
    if (!a || consumed.has(a.hex)) continue;
    const group = [a.hex];
    for (let j = i + 1; j < usages.length; j++) {
      const b = usages[j];
      if (!b || consumed.has(b.hex)) continue;
      if (colorDistance(a.rgb, b.rgb) <= DUPLICATE_DISTANCE) {
        group.push(b.hex);
        consumed.add(b.hex);
      }
    }
    if (group.length > 1) duplicateGroups.push(group);
  }

  const entries: ColorEntry[] = usages.map((u, idx) => {
    const withWhite = contrastRatio(u.rgb, WHITE);
    const withBlack = contrastRatio(u.rgb, BLACK);
    const neighbors: ColorNeighbor[] = usages
      .filter((o) => o.hex !== u.hex)
      .map((o) => ({ hex: o.hex, ratio: contrastRatio(u.rgb, o.rgb) }))
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, 3);
    const rating = ratingFor(u.rgb);
    const role = classifyRole(u);
    const needsFix = role === 'text' && rating === 'Fail';
    return {
      token: `${role}/${String(idx + 1).padStart(2, '0')}`,
      hex: u.hex,
      rgb: u.rgb,
      role,
      usageCount: u.count,
      contrastWithWhite: withWhite,
      contrastWithBlack: withBlack,
      neighbors,
      rating,
      suggestedReplacement: needsFix
        ? suggestAccessibleColor(u.rgb, WHITE, 4.5)
        : undefined,
    };
  });

  return {
    entries,
    totalColors: entries.length,
    duplicateGroups,
    unusedTokens: [],
  };
}

/**
 * ColorAnalyzer — palette hygiene: duplicates, bloat, and low-contrast tokens.
 * Also produces the full color inventory consumed by the dashboard.
 */
export const ColorAnalyzer: Analyzer = {
  id: 'color',
  category: 'color',
  title: 'Color System',
  icon: 'Palette',

  analyze(ctx: AnalyzerContext) {
    const inventory = buildColorInventory(ctx.nodes);
    const issues: Issue[] = [];
    const recommendations: string[] = [];

    const findNodesWithHex = (hex: string): AuditNode[] =>
      ctx.nodes.filter(
        (n) =>
          n.visible &&
          (n.fills.some((f) => f.type === 'SOLID' && figmaToHex(f.color) === hex) ||
            n.strokes.some((f) => f.type === 'SOLID' && figmaToHex(f.color) === hex)),
      );

    // Too many colors.
    if (inventory.totalColors > TOO_MANY_COLORS) {
      issues.push(
        buildIssue({
          category: 'color',
          analyzerId: 'color',
          title: `Palette bloat — ${inventory.totalColors} distinct colors`,
          description: `This screen uses ${inventory.totalColors} distinct colors. Large palettes are hard to maintain and produce inconsistent contrast. Consolidate to a documented set of tokens.`,
          severity: 'medium',
          nodes: [],
        }),
      );
      recommendations.push('Consolidate the palette into a small set of reusable tokens.');
    }

    // Near-duplicate colors.
    for (const group of inventory.duplicateGroups) {
      const affected = group.flatMap(findNodesWithHex).slice(0, 20);
      issues.push(
        buildIssue({
          category: 'color',
          analyzerId: 'color',
          title: `Near-duplicate colors: ${group.join(', ')}`,
          description: `These ${group.length} colors are visually almost identical. Merge them into one token to keep the design system consistent.`,
          severity: 'low',
          nodes: affected,
        }),
      );
    }
    if (inventory.duplicateGroups.length > 0) {
      recommendations.push('Merge near-duplicate colors into single tokens.');
    }

    // Low-contrast text tokens.
    const failingText = inventory.entries.filter(
      (e) => e.role === 'text' && e.rating === 'Fail',
    );
    for (const entry of failingText) {
      const affected = findNodesWithHex(entry.hex).slice(0, 20);
      issues.push(
        buildIssue({
          category: 'color',
          analyzerId: 'color',
          title: `Text color ${entry.hex} rarely passes contrast`,
          description: `${entry.hex} fails WCAG contrast against both white and black backgrounds, so it cannot be used safely for text. Consider ${entry.suggestedReplacement}.`,
          severity: 'high',
          wcag: '1.4.3 Contrast (Minimum)',
          wcagLevel: 'AA',
          nodes: affected,
          fix: entry.suggestedReplacement
            ? {
                kind: 'setTextColor',
                label: 'Replace token color',
                current: entry.hex,
                suggestedValue: entry.suggestedReplacement,
                autoFixable: false,
              }
            : undefined,
        }),
      );
    }

    return makeResult(this, issues, recommendations, { colorInventory: inventory });
  },
};
