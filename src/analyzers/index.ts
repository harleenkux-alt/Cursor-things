import type { Analyzer } from './base';
import { ContrastAnalyzer } from './contrastAnalyzer';
import { ColorAnalyzer } from './colorAnalyzer';
import { TypographyAnalyzer } from './typographyAnalyzer';
import { SpacingAnalyzer } from './spacingAnalyzer';
import { LayoutAnalyzer } from './layoutAnalyzer';
import { ComponentAnalyzer } from './componentAnalyzer';
import { InteractionAnalyzer } from './interactionAnalyzer';
import { MotionAnalyzer } from './motionAnalyzer';
import { LanguageAnalyzer } from './languageAnalyzer';
import { CognitiveAnalyzer } from './cognitiveAnalyzer';
import { ImageAnalyzer } from './imageAnalyzer';

/**
 * The ordered registry of analyzers. Adding a new analyzer is as simple as
 * implementing the {@link Analyzer} contract and appending it here — the runner,
 * scorer, report generator, and UI all consume this list.
 */
export const ANALYZERS: readonly Analyzer[] = [
  ContrastAnalyzer,
  ColorAnalyzer,
  TypographyAnalyzer,
  SpacingAnalyzer,
  LayoutAnalyzer,
  ComponentAnalyzer,
  InteractionAnalyzer,
  MotionAnalyzer,
  LanguageAnalyzer,
  CognitiveAnalyzer,
  ImageAnalyzer,
] as const;

export * from './base';
export {
  ContrastAnalyzer,
  ColorAnalyzer,
  TypographyAnalyzer,
  SpacingAnalyzer,
  LayoutAnalyzer,
  ComponentAnalyzer,
  InteractionAnalyzer,
  MotionAnalyzer,
  LanguageAnalyzer,
  CognitiveAnalyzer,
  ImageAnalyzer,
};
export { buildColorInventory } from './colorAnalyzer';
