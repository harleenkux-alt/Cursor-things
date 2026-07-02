/**
 * Types for the Experience Accessibility feature — educational simulations and
 * heuristic analyses that help designers understand how their interface may be
 * experienced by users with different accessibility needs.
 *
 * IMPORTANT: These are approximations, never a claim of replicating a real
 * person's experience. The UI surfaces this disclaimer prominently.
 */

export const SIMULATION_DISCLAIMER =
  'These simulations are educational approximations designed to help identify potential accessibility issues. Individual experiences vary.';

export type ExperienceTab =
  | 'visual'
  | 'motor'
  | 'hearing'
  | 'screenReader'
  | 'keyboard'
  | 'cognitive'
  | 'motion'
  | 'summary';

/** Vision conditions simulated by re-rendering the exported frame image. */
export type VisualConditionId =
  | 'normal'
  | 'lowVision'
  | 'cataracts'
  | 'glaucoma'
  | 'macular'
  | 'tunnel'
  | 'diabetic'
  | 'retinitis'
  | 'blurred'
  | 'reducedContrast';

/** Color vision deficiency types with scientifically-accepted matrices. */
export type CvdType =
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly';

/** Any visual filter that can be applied to the preview canvas. */
export type VisualFilterId = VisualConditionId | CvdType;

export type SimStatus = 'pass' | 'warning' | 'fail';

/** Rating scale used by the cognitive experience analysis. */
export type CognitiveRating = 'excellent' | 'good' | 'needsImprovement' | 'critical';

// ---------------------------------------------------------------------------
// The image payload exported from the Figma frame for canvas rendering.
// ---------------------------------------------------------------------------

export interface FrameImage {
  bytes: Uint8Array;
  width: number;
  height: number;
  scale: number;
}

// ---------------------------------------------------------------------------
// Per-module result models
// ---------------------------------------------------------------------------

export interface MotorTarget {
  nodeId: string;
  name: string;
  width: number;
  height: number;
  status: SimStatus;
  reason: string;
}

export interface MotorResult {
  score: number;
  targets: MotorTarget[];
  gestureIssues: SimIssue[];
  recommendations: string[];
}

export interface HearingMedia {
  nodeId: string;
  name: string;
  kind: 'video' | 'audio' | 'notification';
  status: SimStatus;
  recommendation: string;
}

export interface HearingResult {
  score: number;
  media: HearingMedia[];
  recommendations: string[];
}

export interface ReadingOrderItem {
  order: number;
  nodeId: string;
  role: string;
  accessibleName: string;
  text: string;
  problems: string[];
  /** Bounding box (in image/px space relative to frame) for highlight overlay. */
  bounds: { x: number; y: number; width: number; height: number };
}

export interface ScreenReaderResult {
  score: number;
  items: ReadingOrderItem[];
  problems: SimIssue[];
}

export interface FocusStop {
  order: number;
  nodeId: string;
  name: string;
  role: string;
  bounds: { x: number; y: number; width: number; height: number };
  problems: string[];
}

export interface KeyboardResult {
  score: number;
  stops: FocusStop[];
  issues: SimIssue[];
}

export interface CognitiveMetric {
  id: string;
  label: string;
  value: string;
  rating: CognitiveRating;
  hint: string;
}

export interface CognitiveExperienceResult {
  score: number;
  metrics: CognitiveMetric[];
  recommendations: string[];
}

export interface MotionExperienceItem {
  nodeId: string;
  name: string;
  kind: string;
  status: SimStatus;
  recommendation: string;
}

export interface MotionExperienceResult {
  score: number;
  items: MotionExperienceItem[];
  recommendations: string[];
}

export interface ColorPairCheck {
  fgHex: string;
  bgHex: string;
  normalRatio: number;
  status: SimStatus;
  /** How confusable the pair becomes under a chosen CVD (0..1, higher = worse). */
  confusion: number;
}

export interface ColorExperienceResult {
  score: number;
  totalColors: number;
  pairs: ColorPairCheck[];
  recommendations: string[];
}

export interface VisualExperienceResult {
  score: number;
  lowContrastRatio: number;
  recommendations: string[];
}

export interface SimIssue {
  id: string;
  title: string;
  description: string;
  status: SimStatus;
  nodeIds: string[];
  wcag?: string;
}

// ---------------------------------------------------------------------------
// Aggregated report + summary
// ---------------------------------------------------------------------------

export interface ExperienceCategoryScore {
  id: string;
  label: string;
  score: number;
}

export interface ExperienceSummary {
  score: number;
  categories: ExperienceCategoryScore[];
  issueCount: number;
  recommendations: string[];
}

export interface ExperienceReport {
  generatedAt: number;
  visual: VisualExperienceResult;
  color: ColorExperienceResult;
  motor: MotorResult;
  hearing: HearingResult;
  screenReader: ScreenReaderResult;
  keyboard: KeyboardResult;
  cognitive: CognitiveExperienceResult;
  motion: MotionExperienceResult;
  summary: ExperienceSummary;
  meta: {
    nodeCount: number;
    documentName: string;
    pageName: string;
  };
}

// ---------------------------------------------------------------------------
// Dyslexia preview settings (UI-only, non-destructive)
// ---------------------------------------------------------------------------

export type DyslexiaFont = 'default' | 'OpenDyslexic' | 'Atkinson Hyperlegible' | 'Lexend';

export interface DyslexiaSettings {
  font: DyslexiaFont;
  letterSpacing: number;
  lineSpacing: number;
  wordSpacing: number;
}

export const DEFAULT_DYSLEXIA: DyslexiaSettings = {
  font: 'Lexend',
  letterSpacing: 0.05,
  lineSpacing: 1.6,
  wordSpacing: 0.16,
};
