import type { CvdType } from '@/types/experience';

/**
 * Scientifically-accepted color vision deficiency (CVD) transformation
 * matrices. Each is a 3×3 matrix applied to linearized-ish sRGB values. These
 * are the widely-used matrices (Machado / Viénot-derived) adopted across
 * accessibility tooling.
 *
 * Rows map to output R, G, B; columns to input R, G, B.
 */
export type ColorMatrix = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

export const CVD_MATRICES: Record<CvdType, ColorMatrix> = {
  protanopia: [0.567, 0.433, 0.0, 0.558, 0.442, 0.0, 0.0, 0.242, 0.758],
  protanomaly: [0.817, 0.183, 0.0, 0.333, 0.667, 0.0, 0.0, 0.125, 0.875],
  deuteranopia: [0.625, 0.375, 0.0, 0.7, 0.3, 0.0, 0.0, 0.3, 0.7],
  deuteranomaly: [0.8, 0.2, 0.0, 0.258, 0.742, 0.0, 0.0, 0.142, 0.858],
  tritanopia: [0.95, 0.05, 0.0, 0.0, 0.433, 0.567, 0.0, 0.475, 0.525],
  tritanomaly: [0.967, 0.033, 0.0, 0.0, 0.733, 0.267, 0.0, 0.183, 0.817],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  achromatomaly: [0.618, 0.32, 0.062, 0.163, 0.775, 0.062, 0.163, 0.32, 0.516],
};

export const CVD_LABELS: Record<CvdType, string> = {
  protanopia: 'Protanopia (no red)',
  protanomaly: 'Protanomaly (weak red)',
  deuteranopia: 'Deuteranopia (no green)',
  deuteranomaly: 'Deuteranomaly (weak green)',
  tritanopia: 'Tritanopia (no blue)',
  tritanomaly: 'Tritanomaly (weak blue)',
  achromatopsia: 'Achromatopsia (no color)',
  achromatomaly: 'Achromatomaly (weak color)',
};

export const CVD_PREVALENCE: Record<CvdType, string> = {
  protanopia: '~1% of men',
  protanomaly: '~1% of men',
  deuteranopia: '~1% of men',
  deuteranomaly: '~5% of men (most common)',
  tritanopia: 'Very rare',
  tritanomaly: 'Rare',
  achromatopsia: 'Extremely rare',
  achromatomaly: 'Very rare',
};

/** Apply a 3×3 color matrix to a single RGB triple (0..255). */
export function applyMatrixToRgb(
  matrix: ColorMatrix,
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const nr = matrix[0] * r + matrix[1] * g + matrix[2] * b;
  const ng = matrix[3] * r + matrix[4] * g + matrix[5] * b;
  const nb = matrix[6] * r + matrix[7] * g + matrix[8] * b;
  return [clamp255(nr), clamp255(ng), clamp255(nb)];
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}
