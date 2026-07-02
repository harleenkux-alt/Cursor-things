import type { VisualConditionId } from '@/types/experience';

/**
 * Declarative render specs for each simulated vision condition. The renderer
 * (see {@link renderVisual}) reads these to compose CSS canvas filters and
 * overlay passes. Values are tuned for educational clarity, not clinical
 * precision.
 */

export interface Overlay {
  kind: 'tint' | 'vignette' | 'centralLoss' | 'spots';
  /** Overlay color (for tint / spots / vignette edge). */
  color?: string;
  /** 0..1 strength. */
  intensity?: number;
  /** Number of blots for the `spots` overlay. */
  count?: number;
}

export interface VisualConditionSpec {
  id: VisualConditionId;
  label: string;
  description: string;
  /** Base blur radius in px at reference width (1000px); scaled to image. */
  blur?: number;
  contrast?: number;
  brightness?: number;
  saturate?: number;
  overlays?: Overlay[];
}

export const VISUAL_CONDITIONS: Record<VisualConditionId, VisualConditionSpec> = {
  normal: {
    id: 'normal',
    label: 'Normal',
    description: 'No simulation applied — the design as authored.',
  },
  lowVision: {
    id: 'lowVision',
    label: 'Low Vision',
    description:
      'Reduced acuity and contrast sensitivity. Fine detail and low-contrast text become hard to resolve.',
    blur: 2,
    contrast: 0.78,
    brightness: 1.02,
  },
  cataracts: {
    id: 'cataracts',
    label: 'Cataracts',
    description:
      'Clouding of the lens: reduced sharpness, a yellow-brown tint, glare/halos and lowered contrast.',
    blur: 2.2,
    contrast: 0.72,
    brightness: 1.12,
    saturate: 0.9,
    overlays: [
      { kind: 'tint', color: '#C9A227', intensity: 0.22 },
      { kind: 'vignette', color: '#ffffff', intensity: 0.15 },
    ],
  },
  glaucoma: {
    id: 'glaucoma',
    label: 'Glaucoma',
    description:
      'Progressive loss of peripheral vision creating dark edges that close inward.',
    blur: 0.6,
    contrast: 0.95,
    overlays: [{ kind: 'vignette', color: '#000000', intensity: 0.85 }],
  },
  macular: {
    id: 'macular',
    label: 'Macular Degeneration',
    description:
      'Loss of central vision: a blurred/obscured spot in the middle makes reading and detail difficult.',
    blur: 0.8,
    overlays: [{ kind: 'centralLoss', color: '#4b4b4b', intensity: 0.9 }],
  },
  tunnel: {
    id: 'tunnel',
    label: 'Tunnel Vision',
    description:
      'Only a narrow central field remains; the surroundings are lost entirely.',
    blur: 0.4,
    overlays: [{ kind: 'vignette', color: '#000000', intensity: 0.96 }],
  },
  diabetic: {
    id: 'diabetic',
    label: 'Diabetic Retinopathy',
    description:
      'Scattered dark floaters/blots and blurred patches obscure parts of the view.',
    blur: 1.4,
    contrast: 0.85,
    overlays: [{ kind: 'spots', color: '#101010', intensity: 0.8, count: 14 }],
  },
  retinitis: {
    id: 'retinitis',
    label: 'Retinitis Pigmentosa',
    description:
      'Severe peripheral loss ("night blindness") combined with patchy gaps in the remaining field.',
    blur: 0.6,
    contrast: 0.9,
    overlays: [
      { kind: 'vignette', color: '#000000', intensity: 0.92 },
      { kind: 'spots', color: '#050505', intensity: 0.7, count: 8 },
    ],
  },
  blurred: {
    id: 'blurred',
    label: 'Blurred Vision',
    description: 'General uncorrected refractive blur (e.g. missing glasses).',
    blur: 4.5,
  },
  reducedContrast: {
    id: 'reducedContrast',
    label: 'Reduced Contrast',
    description:
      'Reduced contrast sensitivity — subtle tonal differences become imperceptible.',
    contrast: 0.5,
    brightness: 1.05,
  },
};

export const VISUAL_CONDITION_ORDER: VisualConditionId[] = [
  'normal',
  'lowVision',
  'blurred',
  'reducedContrast',
  'cataracts',
  'glaucoma',
  'macular',
  'tunnel',
  'diabetic',
  'retinitis',
];
