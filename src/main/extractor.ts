import type {
  AuditNode,
  EffectInfo,
  PaintInfo,
  ReactionInfo,
  RGBAColor,
  SceneSnapshot,
  TextInfo,
} from '@/models/auditNode';
import { resolveFontWeight } from './fontWeight';

/**
 * Traverses a Figma scene subtree and produces a plain, serializable
 * {@link SceneSnapshot} that can be posted to the UI thread. Runs entirely in
 * the sandbox; the UI never touches the live `figma` node objects.
 */

type BBox = { x: number; y: number; width: number; height: number } | null;

const isMixed = (v: unknown): boolean => v === figma.mixed;

function safeNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback;
}

function extractPaints(paints: readonly Paint[] | typeof figma.mixed): PaintInfo[] {
  if (isMixed(paints) || !Array.isArray(paints)) return [];
  const out: PaintInfo[] = [];
  for (const paint of paints as readonly Paint[]) {
    if (paint.visible === false) continue;
    if (paint.type === 'SOLID') {
      const color: RGBAColor = {
        r: paint.color.r,
        g: paint.color.g,
        b: paint.color.b,
        a: paint.opacity ?? 1,
      };
      out.push({ type: 'SOLID', color });
    } else if (paint.type.startsWith('GRADIENT')) {
      const stops = ('gradientStops' in paint ? paint.gradientStops : []).map((s) => ({
        r: s.color.r,
        g: s.color.g,
        b: s.color.b,
        a: s.color.a,
      }));
      out.push({ type: 'GRADIENT', stops });
    } else if (paint.type === 'IMAGE') {
      out.push({ type: 'IMAGE', scaleMode: paint.scaleMode });
    }
  }
  return out;
}

function extractEffects(effects: readonly Effect[] | undefined): EffectInfo[] {
  if (!effects) return [];
  return effects.map((e) => ({
    type: e.type,
    visible: e.visible !== false,
    radius: 'radius' in e ? e.radius : undefined,
  }));
}

function extractReactions(node: SceneNode): ReactionInfo[] {
  const reactions = (node as unknown as { reactions?: readonly Reaction[] }).reactions;
  if (!reactions || reactions.length === 0) return [];
  return reactions.map((r) => {
    const action = r.actions?.[0] ?? (r as unknown as { action?: unknown }).action;
    const transition = (action as { transition?: unknown } | undefined)?.transition as
      | { type?: string; duration?: number }
      | undefined;
    return {
      trigger: r.trigger?.type,
      actionType: (action as { type?: string } | undefined)?.type,
      transitionType: transition?.type,
      transitionDurationMs: transition?.duration ? transition.duration * 1000 : undefined,
      hasSmartAnimate: transition?.type === 'SMART_ANIMATE',
    };
  });
}

function extractText(node: TextNode): TextInfo {
  const fontName = isMixed(node.fontName)
    ? { family: 'Mixed', style: 'Mixed' }
    : (node.fontName as FontName);
  const fontSize = isMixed(node.fontSize) ? 14 : (node.fontSize as number);
  const lineHeightRaw = node.lineHeight;
  let lineHeight: TextInfo['lineHeight'] = { value: 0, unit: 'AUTO' };
  if (!isMixed(lineHeightRaw)) {
    const lh = lineHeightRaw as LineHeight;
    lineHeight =
      lh.unit === 'AUTO'
        ? { value: 0, unit: 'AUTO' }
        : { value: lh.value, unit: lh.unit };
  }
  const letterSpacingRaw = node.letterSpacing;
  const letterSpacing: TextInfo['letterSpacing'] = isMixed(letterSpacingRaw)
    ? { value: 0, unit: 'PERCENT' }
    : {
        value: (letterSpacingRaw as LetterSpacing).value,
        unit: (letterSpacingRaw as LetterSpacing).unit,
      };

  return {
    characters: node.characters,
    fontSize,
    fontFamily: fontName.family,
    fontStyle: fontName.style,
    fontWeight: resolveFontWeight(fontName.style),
    lineHeight,
    letterSpacing,
    paragraphSpacing: safeNumber(node.paragraphSpacing),
    textAlignHorizontal: isMixed(node.textAlignHorizontal)
      ? 'LEFT'
      : (node.textAlignHorizontal as TextInfo['textAlignHorizontal']),
    textCase: isMixed(node.textCase) ? 'ORIGINAL' : String(node.textCase),
    textDecoration: isMixed(node.textDecoration) ? 'NONE' : String(node.textDecoration),
  };
}

function buildNode(node: SceneNode, rootBox: BBox, depth: number): AuditNode {
  const box = 'absoluteBoundingBox' in node ? node.absoluteBoundingBox : null;
  const x = box && rootBox ? box.x - rootBox.x : safeNumber((node as LayoutMixin).x);
  const y = box && rootBox ? box.y - rootBox.y : safeNumber((node as LayoutMixin).y);
  const width = box ? box.width : safeNumber((node as LayoutMixin).width);
  const height = box ? box.height : safeNumber((node as LayoutMixin).height);

  const geometry = node as unknown as GeometryMixin & {
    strokeWeight?: number | typeof figma.mixed;
  };
  const cornerRadius =
    'cornerRadius' in node && !isMixed(node.cornerRadius)
      ? safeNumber(node.cornerRadius as number)
      : 0;
  const strokeWeight =
    'strokeWeight' in geometry && !isMixed(geometry.strokeWeight)
      ? safeNumber(geometry.strokeWeight as number)
      : 0;

  const auto = node as unknown as Partial<AutoLayoutMixin>;
  const layoutMode = (auto.layoutMode as AuditNode['layoutMode']) ?? 'NONE';

  const fills = 'fills' in node ? extractPaints(node.fills) : [];
  const strokes = 'strokes' in node ? extractPaints(node.strokes) : [];

  const auditNode: AuditNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    locked: node.locked,
    opacity: 'opacity' in node ? safeNumber(node.opacity, 1) : 1,
    x,
    y,
    width,
    height,
    depth,
    fills,
    strokes,
    strokeWeight,
    cornerRadius,
    effects: 'effects' in node ? extractEffects(node.effects) : [],
    layoutMode,
    itemSpacing: safeNumber(auto.itemSpacing),
    paddingTop: safeNumber(auto.paddingTop),
    paddingRight: safeNumber(auto.paddingRight),
    paddingBottom: safeNumber(auto.paddingBottom),
    paddingLeft: safeNumber(auto.paddingLeft),
    primaryAxisAlignItems: auto.primaryAxisAlignItems,
    counterAxisAlignItems: auto.counterAxisAlignItems,
    layoutGrow: (node as unknown as { layoutGrow?: number }).layoutGrow,
    constraints:
      'constraints' in node && node.constraints
        ? {
            horizontal: node.constraints.horizontal,
            vertical: node.constraints.vertical,
          }
        : undefined,
    mainComponentName:
      node.type === 'INSTANCE'
        ? (node as InstanceNode).mainComponent?.name ?? undefined
        : undefined,
    componentPropertyNames:
      node.type === 'INSTANCE'
        ? Object.keys((node as InstanceNode).componentProperties ?? {})
        : undefined,
    isComponentInstance: node.type === 'INSTANCE',
    hasImageFill: fills.some((f) => f.type === 'IMAGE'),
    isMask: 'isMask' in node ? Boolean(node.isMask) : false,
    reactions: extractReactions(node),
    text: node.type === 'TEXT' ? extractText(node as TextNode) : undefined,
    children: [],
  };

  if ('children' in node) {
    for (const child of node.children) {
      auditNode.children.push(buildNode(child, rootBox, depth + 1));
    }
  }

  return auditNode;
}

export function extractSnapshot(root: SceneNode): SceneSnapshot {
  const start = Date.now();
  const rootBox = 'absoluteBoundingBox' in root ? root.absoluteBoundingBox : null;
  const tree = buildNode(root, rootBox, 0);
  const nodeCount = countNodes(tree);
  return {
    root: tree,
    nodeCount,
    extractionMs: Date.now() - start,
    documentName: figma.root.name,
    pageName: figma.currentPage.name,
  };
}

function countNodes(node: AuditNode): number {
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}
