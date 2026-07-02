import type { AnalyzerContext } from '@/analyzers/base';
import { buildColorInventory } from '@/analyzers/colorAnalyzer';
import type { ColorEntry } from '@/types/analysis';
import type { ColorExperienceResult, ColorPairCheck, CvdType, SimStatus } from '@/types/experience';
import { contrastRatio, hexToRgb, type RGB } from '@/utils/color';
import { CVD_MATRICES, applyMatrixToRgb } from './colorMatrices';
import { clampScore } from './types';

/** The CVDs we test important color combinations against. */
const TEST_CVDS: CvdType[] = ['deuteranopia', 'protanopia', 'tritanopia'];

function transform(rgb: RGB, cvd: CvdType): RGB {
  const [r, g, b] = applyMatrixToRgb(CVD_MATRICES[cvd], rgb.r, rgb.g, rgb.b);
  return { r, g, b };
}

/**
 * ColorBlindSimulation (palette side) — checks important foreground/background
 * combinations for contrast under normal vision and common color-vision
 * deficiencies, surfacing pass / warning / fail per pair.
 */
export function runColorExperience(ctx: AnalyzerContext): ColorExperienceResult {
  const inventory = buildColorInventory(ctx.nodes);
  const entries = inventory.entries;

  const foregrounds = pick(entries, ['text', 'primary', 'secondary', 'semantic'], 6);
  const backgrounds = uniqueHex([
    '#FFFFFF',
    ...pick(entries, ['background', 'surface', 'neutral'], 4).map((e) => e.hex),
  ]);

  const pairs: ColorPairCheck[] = [];
  for (const fg of foregrounds) {
    for (const bgHex of backgrounds) {
      if (fg.hex === bgHex) continue;
      const fgRgb = hexToRgb(fg.hex);
      const bgRgb = hexToRgb(bgHex);
      const normalRatio = contrastRatio(fgRgb, bgRgb);

      let minCvdRatio = normalRatio;
      for (const cvd of TEST_CVDS) {
        const ratio = contrastRatio(transform(fgRgb, cvd), transform(bgRgb, cvd));
        minCvdRatio = Math.min(minCvdRatio, ratio);
      }

      const status: SimStatus =
        normalRatio < 4.5 || minCvdRatio < 3
          ? 'fail'
          : minCvdRatio < 4.5
            ? 'warning'
            : 'pass';

      pairs.push({
        fgHex: fg.hex,
        bgHex,
        normalRatio,
        status,
        confusion: normalRatio > 0 ? Math.max(0, (normalRatio - minCvdRatio) / normalRatio) : 0,
      });
    }
  }

  pairs.sort((a, b) => statusRank(a.status) - statusRank(b.status) || b.confusion - a.confusion);

  const fails = pairs.filter((p) => p.status === 'fail').length;
  const warns = pairs.filter((p) => p.status === 'warning').length;
  const score =
    pairs.length === 0
      ? 100
      : clampScore(100 - (fails / pairs.length) * 70 - (warns / pairs.length) * 30);

  const recommendations: string[] = [];
  if (fails > 0)
    recommendations.push('Some color pairs fail contrast — never rely on hue alone to convey meaning.');
  if (warns > 0)
    recommendations.push('Add non-color cues (icons, text, patterns) for status and selection.');
  if (fails + warns === 0)
    recommendations.push('Color combinations hold up well across common color-vision deficiencies.');

  return {
    score,
    totalColors: inventory.totalColors,
    pairs: pairs.slice(0, 24),
    recommendations,
  };
}

function pick(entries: ColorEntry[], roles: string[], limit: number): ColorEntry[] {
  return entries
    .filter((e) => roles.includes(e.role))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

function uniqueHex(hexes: string[]): string[] {
  return [...new Set(hexes.map((h) => h.toUpperCase()))];
}

function statusRank(s: SimStatus): number {
  return s === 'fail' ? 0 : s === 'warning' ? 1 : 2;
}
