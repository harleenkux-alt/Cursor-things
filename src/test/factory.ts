import type { AuditNode, SceneSnapshot, TextInfo } from '@/models/auditNode';

/** Test helper: build an AuditNode with sensible defaults. */
export function makeNode(partial: Partial<AuditNode> = {}): AuditNode {
  return {
    id: partial.id ?? `n-${Math.random().toString(36).slice(2, 8)}`,
    name: partial.name ?? 'Layer',
    type: partial.type ?? 'FRAME',
    visible: partial.visible ?? true,
    locked: partial.locked ?? false,
    opacity: partial.opacity ?? 1,
    x: partial.x ?? 0,
    y: partial.y ?? 0,
    width: partial.width ?? 100,
    height: partial.height ?? 100,
    depth: partial.depth ?? 0,
    fills: partial.fills ?? [],
    strokes: partial.strokes ?? [],
    strokeWeight: partial.strokeWeight ?? 0,
    cornerRadius: partial.cornerRadius ?? 0,
    effects: partial.effects ?? [],
    layoutMode: partial.layoutMode ?? 'NONE',
    itemSpacing: partial.itemSpacing ?? 0,
    paddingTop: partial.paddingTop ?? 0,
    paddingRight: partial.paddingRight ?? 0,
    paddingBottom: partial.paddingBottom ?? 0,
    paddingLeft: partial.paddingLeft ?? 0,
    primaryAxisAlignItems: partial.primaryAxisAlignItems,
    counterAxisAlignItems: partial.counterAxisAlignItems,
    layoutGrow: partial.layoutGrow,
    constraints: partial.constraints,
    mainComponentName: partial.mainComponentName,
    componentPropertyNames: partial.componentPropertyNames,
    isComponentInstance: partial.isComponentInstance ?? false,
    hasImageFill: partial.hasImageFill ?? false,
    isMask: partial.isMask ?? false,
    reactions: partial.reactions ?? [],
    text: partial.text,
    children: partial.children ?? [],
  };
}

export function makeText(
  characters: string,
  overrides: Partial<TextInfo> = {},
): TextInfo {
  return {
    characters,
    fontSize: overrides.fontSize ?? 16,
    fontFamily: overrides.fontFamily ?? 'Inter',
    fontStyle: overrides.fontStyle ?? 'Regular',
    fontWeight: overrides.fontWeight ?? 400,
    lineHeight: overrides.lineHeight ?? { value: 150, unit: 'PERCENT' },
    letterSpacing: overrides.letterSpacing ?? { value: 0, unit: 'PERCENT' },
    paragraphSpacing: overrides.paragraphSpacing ?? 0,
    textAlignHorizontal: overrides.textAlignHorizontal ?? 'LEFT',
    textCase: overrides.textCase ?? 'ORIGINAL',
    textDecoration: overrides.textDecoration ?? 'NONE',
  };
}

const solid = (r: number, g: number, b: number, a = 1) =>
  ({ type: 'SOLID', color: { r, g, b, a } }) as const;

export const solidFill = solid;

export function makeSnapshot(root: AuditNode): SceneSnapshot {
  const count = (n: AuditNode): number =>
    1 + n.children.reduce((s, c) => s + count(c), 0);
  return {
    root,
    nodeCount: count(root),
    extractionMs: 1,
    documentName: 'Test Doc',
    pageName: 'Test Page',
  };
}
