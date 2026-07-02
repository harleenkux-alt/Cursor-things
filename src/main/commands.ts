import type { FixSuggestion } from '@/types/analysis';
import { hexToRgb } from '@/utils/color';

/**
 * Imperative commands executed in the sandbox in response to UI actions:
 * selecting nodes ("Locate") and applying remediation fixes ("Apply").
 */

async function getNodesByIds(ids: string[]): Promise<SceneNode[]> {
  const nodes: SceneNode[] = [];
  for (const id of ids) {
    const node = await figma.getNodeByIdAsync(id);
    if (node && 'type' in node && node.type !== 'PAGE' && node.type !== 'DOCUMENT') {
      nodes.push(node as SceneNode);
    }
  }
  return nodes;
}

/** Select the given nodes and scroll/zoom the viewport to them. */
export async function locateNodes(ids: string[]): Promise<void> {
  const nodes = await getNodesByIds(ids);
  if (nodes.length === 0) {
    figma.notify('Could not find the layer — it may have been deleted.', {
      error: true,
    });
    return;
  }
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}

export interface FixResult {
  ok: boolean;
  message?: string;
  nodeId?: string;
}

/** Apply a single remediation fix. Returns whether it succeeded. */
export async function applyFix(fix: FixSuggestion): Promise<FixResult> {
  if (!fix.nodeId) {
    return { ok: false, message: 'This fix has no target layer.' };
  }
  const node = await figma.getNodeByIdAsync(fix.nodeId);
  if (!node) {
    return { ok: false, message: 'Target layer no longer exists.' };
  }

  try {
    switch (fix.kind) {
      case 'setFontSize': {
        const text = node as TextNode;
        if (text.type !== 'TEXT') return notApplicable();
        await loadFonts(text);
        const size = parseFloat(fix.suggestedValue ?? fix.recommended ?? '0');
        if (!size) return { ok: false, message: 'No target size specified.' };
        text.fontSize = size;
        break;
      }
      case 'setLineHeight': {
        const text = node as TextNode;
        if (text.type !== 'TEXT') return notApplicable();
        await loadFonts(text);
        const value = parseFloat(fix.suggestedValue ?? fix.recommended ?? '0');
        if (!value) return { ok: false, message: 'No target line height.' };
        text.lineHeight = { value, unit: 'PERCENT' };
        break;
      }
      case 'setTextColor':
      case 'setFillColor': {
        const hex = fix.suggestedValue;
        if (!hex) return { ok: false, message: 'No target color specified.' };
        const { r, g, b } = hexToRgb(hex);
        if ('fills' in node) {
          const solid: SolidPaint = {
            type: 'SOLID',
            color: { r: r / 255, g: g / 255, b: b / 255 },
          };
          (node as unknown as { fills: Paint[] }).fills = [solid];
        }
        break;
      }
      default:
        return { ok: false, message: 'This fix must be applied manually.' };
    }
    figma.currentPage.selection = [node as SceneNode];
    return { ok: true, nodeId: fix.nodeId, message: 'Fix applied.' };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to apply fix.',
    };
  }
}

function notApplicable(): FixResult {
  return { ok: false, message: 'Fix not applicable to this layer type.' };
}

async function loadFonts(text: TextNode): Promise<void> {
  const fonts = text.getRangeAllFontNames(0, Math.max(text.characters.length, 1));
  await Promise.all(fonts.map((f) => figma.loadFontAsync(f)));
}
