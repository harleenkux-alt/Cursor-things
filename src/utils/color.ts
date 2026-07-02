import type { RGBAColor } from '@/models/auditNode';

/**
 * Color science utilities: conversions, WCAG contrast, perceptual grouping.
 *
 * All functions are pure and framework-free so they can be unit tested and
 * reused by any analyzer.
 */

export interface RGB {
  r: number; // 0..255
  g: number;
  b: number;
}

export interface HSL {
  h: number; // 0..360
  s: number; // 0..100
  l: number; // 0..100
}

const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

/** Convert Figma's normalized (0..1) color to 0..255 RGB. */
export function figmaToRgb(color: RGBAColor): RGB {
  return {
    r: Math.round(clamp(color.r, 0, 1) * 255),
    g: Math.round(clamp(color.g, 0, 1) * 255),
    b: Math.round(clamp(color.b, 0, 1) * 255),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function figmaToHex(color: RGBAColor): string {
  return rgbToHex(figmaToRgb(color));
}

/**
 * Composite a foreground color (with alpha) over a background color.
 * Needed because Figma layers can be semi-transparent.
 */
export function blend(fg: RGBAColor, bg: RGB): RGB {
  const a = clamp(fg.a, 0, 1);
  const f = figmaToRgb({ ...fg, a: 1 });
  return {
    r: Math.round(f.r * a + bg.r * (1 - a)),
    g: Math.round(f.g * a + bg.g * (1 - a)),
    b: Math.round(f.b * a + bg.b * (1 - a)),
  };
}

/** Relative luminance per WCAG 2.x definition. */
export function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors (1..21), rounded to 2 decimals. */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export const WHITE: RGB = { r: 255, g: 255, b: 255 };
export const BLACK: RGB = { r: 0, g: 0, b: 0 };

export type WcagTextRating = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/**
 * Rate a contrast ratio for text.
 * @param large whether the text qualifies as "large" (>= 18pt / 24px, or 14pt/18.66px bold).
 */
export function rateContrast(ratio: number, large: boolean): WcagTextRating {
  if (large) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA';
    return 'Fail';
  }
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Suggest an accessible replacement for a foreground color that fails contrast
 * against a background. We keep hue & saturation and walk lightness toward the
 * nearest end until the target ratio is met.
 */
export function suggestAccessibleColor(
  fg: RGB,
  bg: RGB,
  targetRatio = 4.5,
): string {
  if (contrastRatio(fg, bg) >= targetRatio) return rgbToHex(fg);
  const hsl = rgbToHsl(fg);
  const bgLum = relativeLuminance(bg);
  // Decide direction: darken on light backgrounds, lighten on dark ones.
  const goDarker = bgLum > 0.5;
  let best = fg;
  for (let step = 1; step <= 100; step++) {
    const l = goDarker ? Math.max(0, hsl.l - step) : Math.min(100, hsl.l + step);
    const candidate = hslToRgb({ ...hsl, l });
    if (contrastRatio(candidate, bg) >= targetRatio) {
      best = candidate;
      break;
    }
    best = candidate;
  }
  return rgbToHex(best);
}

/** Euclidean distance in RGB space — a cheap perceptual "sameness" proxy. */
export function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export function rgbString({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}
