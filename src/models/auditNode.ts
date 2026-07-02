/**
 * Serializable snapshot model of a Figma scene graph.
 *
 * The Figma main thread traverses the selected frame and produces a tree of
 * {@link AuditNode}s. This plain-object model is transferred to the UI thread
 * where the (pure, testable) analyzers operate on it. Nothing in this file
 * depends on the `figma` global, so the analyzers can be unit-tested in
 * isolation.
 */

export interface RGBAColor {
  r: number; // 0..1
  g: number; // 0..1
  b: number; // 0..1
  a: number; // 0..1
}

export interface SolidPaintInfo {
  type: 'SOLID';
  color: RGBAColor;
  /** Bound variable / style name if the paint references a token. */
  boundVariable?: string;
  styleName?: string;
}

export interface GradientPaintInfo {
  type: 'GRADIENT';
  stops: RGBAColor[];
}

export interface ImagePaintInfo {
  type: 'IMAGE';
  scaleMode?: string;
}

export type PaintInfo = SolidPaintInfo | GradientPaintInfo | ImagePaintInfo;

export interface EffectInfo {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR' | string;
  visible: boolean;
  radius?: number;
}

export interface ReactionInfo {
  trigger?: string; // ON_CLICK, ON_HOVER, ON_PRESS, AFTER_TIMEOUT ...
  actionType?: string; // NODE, URL, BACK ...
  hasSmartAnimate?: boolean;
  transitionType?: string; // SMART_ANIMATE, DISSOLVE, MOVE_IN ...
  transitionDurationMs?: number;
}

export interface TextInfo {
  characters: string;
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  /** Numeric weight resolved from the font style (e.g. "Bold" → 700). */
  fontWeight: number;
  lineHeight: { value: number; unit: 'PIXELS' | 'PERCENT' | 'AUTO' };
  letterSpacing: { value: number; unit: 'PIXELS' | 'PERCENT' };
  paragraphSpacing: number;
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textCase: string;
  textDecoration: string;
}

export type NodeType =
  | 'FRAME'
  | 'GROUP'
  | 'COMPONENT'
  | 'COMPONENT_SET'
  | 'INSTANCE'
  | 'TEXT'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'POLYGON'
  | 'STAR'
  | 'VECTOR'
  | 'LINE'
  | 'BOOLEAN_OPERATION'
  | 'SECTION'
  | 'SLICE'
  | string;

export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL';

export interface AuditNode {
  id: string;
  name: string;
  type: NodeType;
  visible: boolean;
  locked: boolean;
  opacity: number;

  /** Absolute bounding box relative to the analyzed root frame. */
  x: number;
  y: number;
  width: number;
  height: number;

  /** Depth within the analyzed tree (root = 0). */
  depth: number;

  fills: PaintInfo[];
  strokes: PaintInfo[];
  strokeWeight: number;
  cornerRadius: number;
  effects: EffectInfo[];

  // Auto layout
  layoutMode: LayoutMode;
  itemSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  layoutGrow?: number;

  constraints?: { horizontal: string; vertical: string };

  // Component metadata
  mainComponentName?: string;
  componentPropertyNames?: string[];
  isComponentInstance: boolean;

  // Media
  hasImageFill: boolean;
  isMask: boolean;

  // Interaction / motion
  reactions: ReactionInfo[];

  // Text
  text?: TextInfo;

  children: AuditNode[];
}

/** Root payload transferred from the main thread to the UI. */
export interface SceneSnapshot {
  root: AuditNode;
  /** Total number of nodes in the subtree (including root). */
  nodeCount: number;
  /** Wall-clock time (ms) the main thread spent extracting the snapshot. */
  extractionMs: number;
  documentName: string;
  pageName: string;
}

/** Flatten a node tree into a depth-first list. */
export function flattenNodes(node: AuditNode): AuditNode[] {
  const out: AuditNode[] = [node];
  for (const child of node.children) {
    out.push(...flattenNodes(child));
  }
  return out;
}
