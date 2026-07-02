import type { AuditNode } from '@/models/auditNode';

/**
 * Shared semantic inference used by the screen-reader, keyboard, and motor
 * modules. Kept dependency-free and pure so each simulation can reuse it.
 */

export function inferRole(node: AuditNode): string {
  const name = node.name.toLowerCase();
  if (/nav|navbar|tabbar|breadcrumb|sidebar|menu\b/.test(name)) return 'navigation';
  if (/dialog|modal|sheet|drawer|popover/.test(name)) return 'dialog';
  if (/checkbox|radio/.test(name)) return 'checkbox';
  if (/switch|toggle/.test(name)) return 'switch';
  if (/input|field|textbox|textarea|search|combobox|select|dropdown/.test(name))
    return 'textbox';
  if (/button|btn|cta|fab|submit/.test(name)) return 'button';
  if (/link|anchor/.test(name)) return 'link';
  if (/tab\b/.test(name)) return 'tab';
  if (/list\b|listitem|row/.test(name)) return 'list';
  if (/logo|brand/.test(name)) return 'img';
  if (/image|img|photo|avatar|thumbnail|illustration|icon/.test(name) || node.hasImageFill)
    return 'img';
  if (node.type === 'TEXT') {
    if (isHeading(node)) return 'heading';
    return 'text';
  }
  if (/header|footer|banner|hero|section|region|card/.test(name)) return 'region';
  return 'group';
}

export function isHeading(node: AuditNode): boolean {
  if (node.type !== 'TEXT' || !node.text) return false;
  const byName = /h[1-6]\b|heading|title|headline|display/i.test(node.name);
  const byStyle = node.text.fontSize >= 20 && node.text.fontWeight >= 600;
  return byName || byStyle;
}

export function accessibleName(node: AuditNode): string {
  if (node.type === 'TEXT' && node.text) {
    const t = node.text.characters.trim();
    if (t) return t;
  }
  return node.name;
}

export function isInteractive(node: AuditNode): boolean {
  const role = inferRole(node);
  if (['button', 'link', 'textbox', 'checkbox', 'switch', 'tab'].includes(role))
    return true;
  return node.reactions.length > 0 || node.isComponentInstance;
}

export function isMeaningful(node: AuditNode): boolean {
  if (node.type === 'TEXT') return Boolean(node.text?.characters.trim());
  if (node.hasImageFill) return true;
  return isInteractive(node);
}

/** Normalize a node's box to 0..1 fractions of the root frame for overlays. */
export function normBounds(
  node: AuditNode,
  root: AuditNode,
): { x: number; y: number; width: number; height: number } {
  const w = root.width || 1;
  const h = root.height || 1;
  return {
    x: node.x / w,
    y: node.y / h,
    width: node.width / w,
    height: node.height / h,
  };
}

/**
 * Reading / tab order: top-to-bottom, then left-to-right, with a small vertical
 * tolerance so items on the same visual row are ordered by x.
 */
export function sortByReadingOrder(nodes: AuditNode[], rowTolerance = 12): AuditNode[] {
  return [...nodes].sort((a, b) => {
    if (Math.abs(a.y - b.y) <= rowTolerance) return a.x - b.x;
    return a.y - b.y;
  });
}
