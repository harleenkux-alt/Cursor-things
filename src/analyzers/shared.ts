import type { AuditNode } from '@/models/auditNode';
import type { SolidPaintInfo } from '@/models/auditNode';
import { blend, figmaToRgb, WHITE, type RGB } from '@/utils/color';
import type { AnalyzerContext } from './base';

/** First visible solid fill on a node, if any. */
export function firstSolidFill(node: AuditNode): SolidPaintInfo | undefined {
  return node.fills.find((f): f is SolidPaintInfo => f.type === 'SOLID');
}

/**
 * Resolve the effective background color behind a node by walking up the tree
 * until a solid (or blendable) fill is found. Falls back to white — the safest
 * assumption for the Figma canvas.
 */
export function effectiveBackground(
  ctx: AnalyzerContext,
  node: AuditNode,
): RGB {
  let current: AuditNode | undefined = ctx.parentOf(node.id);
  let base: RGB = WHITE;
  const stack: RGB[] = [];
  while (current) {
    const solid = firstSolidFill(current);
    if (solid) {
      stack.unshift(figmaToRgb(solid.color));
      if (solid.color.a >= 0.999) break; // opaque — stop climbing
    }
    current = ctx.parentOf(current.id);
  }
  for (const layer of stack) {
    base = layer; // opaque layers dominate; simple last-opaque model
  }
  return base;
}

/**
 * Resolve the foreground color of a text (or shape) node, composited over its
 * effective background so semi-transparent text is handled correctly.
 */
export function resolvedForeground(
  ctx: AnalyzerContext,
  node: AuditNode,
): RGB | undefined {
  const solid = firstSolidFill(node);
  if (!solid) return undefined;
  const bg = effectiveBackground(ctx, node);
  return blend(solid.color, bg);
}
