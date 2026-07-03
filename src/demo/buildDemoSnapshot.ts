import type { AuditNode } from '@/models/auditNode';
import { makeNode, makeText, makeSnapshot, solidFill } from '@/test/factory';

/**
 * Builds a realistic scene snapshot for the marketing/demo harness so the real
 * analyzers produce genuine, varied issues across every category. This is used
 * ONLY by the screenshot/video demo — never shipped in the plugin.
 */
export function buildDemoSnapshot() {
  let idc = 0;
  const id = () => `demo-${idc++}`;

  const text = (
    name: string,
    chars: string,
    x: number,
    y: number,
    w: number,
    h: number,
    opts: { size?: number; weight?: number; color?: [number, number, number] } = {},
  ): AuditNode =>
    makeNode({
      id: id(),
      name,
      type: 'TEXT',
      x,
      y,
      width: w,
      height: h,
      fills: [solidFill(...(opts.color ?? [0.06, 0.09, 0.16]))],
      text: makeText(chars, { fontSize: opts.size ?? 16, fontWeight: opts.weight ?? 400 }),
    });

  const box = (
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: [number, number, number],
    extra: Partial<AuditNode> = {},
  ): AuditNode =>
    makeNode({ id: id(), name, x, y, width: w, height: h, fills: [solidFill(...fill)], ...extra });

  const children: AuditNode[] = [];

  // Header
  children.push(text('Heading', 'Discover the Essence of Luxury Living', 48, 48, 760, 64, { size: 40, weight: 700 }));
  // Low-contrast + small subtitle (typography + contrast issues)
  children.push(
    text('Subtitle', 'Find your dream home in the most sought-after neighborhoods worldwide.', 48, 120, 620, 20, {
      size: 11,
      color: [0.66, 0.7, 0.75],
    }),
  );

  // Primary button (ok) with label
  const cta = box('Explore Homes Button', 48, 156, 190, 48, [0, 0.372, 0.8], { cornerRadius: 12 });
  cta.children.push(text('CTA Label', 'Explore Homes', 70, 170, 140, 20, { size: 15, weight: 600, color: [1, 1, 1] }));
  children.push(cta);

  // Tiny icon-only button, hover-only (interaction + motor + keyboard issues)
  children.push(
    box('Icon Button', 1150, 48, 20, 20, [0.9, 0.9, 0.9], {
      reactions: [{ trigger: 'ON_HOVER', actionType: 'NODE' }],
    }),
  );

  // Filter chips — small touch targets
  ['All', 'Villa', 'Apartment', 'Penthouse', 'Studio'].forEach((label, i) => {
    const chip = box(`Chip`, 48 + i * 96, 224, 84, 30, [0.95, 0.96, 0.98], { cornerRadius: 999 });
    chip.children.push(text('Chip Label', label, 60 + i * 96, 230, 60, 16, { size: 12, color: [0.4, 0.44, 0.5] }));
    children.push(chip);
  });

  // Section title
  children.push(text('Section Title', 'Featured Properties', 48, 288, 300, 32, { size: 24, weight: 600 }));

  // Property cards with generic-named images (content/alt issues) + semantic badge
  for (let i = 0; i < 2; i++) {
    const cardX = 48 + i * 420;
    const card = box('Card', cardX, 336, 400, 300, [1, 1, 1], { cornerRadius: 12, strokes: [solidFill(0.91, 0.93, 0.96)], strokeWeight: 1 });
    card.children.push(box(i === 0 ? 'image 12' : 'Rectangle 8', cardX + 16, 352, 368, 180, [0.8, 0.82, 0.85], { hasImageFill: true, cornerRadius: 8 }));
    card.children.push(text('Price', `$${i === 0 ? '1,250,000' : '890,000'}`, cardX + 16, 548, 160, 24, { size: 18, weight: 700, color: [0, 0.372, 0.8] }));
    card.children.push(text('Location', i === 0 ? 'Beverly Hills, CA' : 'Aspen, CO', cardX + 16, 578, 200, 18, { size: 11, color: [0.7, 0.72, 0.76] }));
    if (i === 0) card.children.push(box('Sold Badge', cardX + 300, 352, 68, 24, [0.86, 0.15, 0.15], { cornerRadius: 6 }));
    children.push(card);
  }

  // A long, complex paragraph (typography + inclusive reading level)
  children.push(
    text(
      'Description',
      'Leveraging synergistic architectural paradigms, these residences facilitate an unparalleled utilization of space, notwithstanding the inherent complexities of contemporary luxury living environments.',
      48,
      656,
      760,
      64,
      { size: 13, color: [0.3, 0.34, 0.4] },
    ),
  );

  // Auto-playing hero video (hearing + motion)
  children.push(box('Hero Video Player', 900, 336, 252, 160, [0.1, 0.1, 0.12], { cornerRadius: 12, reactions: [{ trigger: 'AFTER_TIMEOUT', actionType: 'NODE', transitionType: 'SMART_ANIMATE', hasSmartAnimate: true }] }));

  // Bottom nav — small icon targets, low contrast labels
  const nav = box('Nav Bar', 0, 740, 1200, 60, [0.98, 0.98, 0.99]);
  ['Home', 'Search', 'Saved', 'Profile'].forEach((label, i) => {
    const item = box('Nav Item', 120 + i * 280, 752, 24, 24, [0.75, 0.77, 0.8], {
      reactions: [{ trigger: 'ON_CLICK', actionType: 'NODE' }],
    });
    item.children.push(text('Nav Label', label, 110 + i * 280, 778, 44, 12, { size: 9, color: [0.72, 0.74, 0.78] }));
    nav.children.push(item);
  });
  children.push(nav);

  const root = makeNode({
    id: 'demo-root',
    name: 'Home / Luxury Living',
    type: 'FRAME',
    width: 1200,
    height: 800,
    fills: [solidFill(0.972, 0.98, 0.988)],
    children,
  });

  return makeSnapshot(root);
}
