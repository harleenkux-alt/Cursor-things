import type { SceneSnapshot } from '@/models/auditNode';
import type { AuditSettings } from '@/types/settings';
import type { ExperienceReport } from '@/types/experience';
import { createContext } from '@/analyzers/base';
import { resetSimIds } from './types';
import { runVisualExperience } from './visualExperience';
import { runColorExperience } from './colorExperience';
import { runMotorAnalysis } from './motorAnalyzer';
import { runHearingAnalysis } from './hearingAnalyzer';
import { runScreenReaderSimulation } from './screenReaderSimulator';
import { runKeyboardSimulation } from './keyboardSimulator';
import { runCognitiveExperience } from './cognitiveExperience';
import { runMotionExperience } from './motionExperience';
import { generateSummary } from './summaryGenerator';

/**
 * SimulationEngine — orchestrates every non-visual experience module over a
 * scene snapshot and assembles the aggregated {@link ExperienceReport}.
 *
 * The live visual/CVD canvas simulations are rendered separately in the UI (see
 * `simulations/canvas.ts`) because they operate on the exported frame image.
 *
 * Each module is isolated in try/catch so one failure never aborts the run.
 */
export function runExperienceAnalysis(
  snapshot: SceneSnapshot,
  settings: AuditSettings,
): ExperienceReport {
  resetSimIds();
  const ctx = createContext(snapshot, settings);

  const visual = safe(() => runVisualExperience(ctx), fallbackScored());
  const color = safe(() => runColorExperience(ctx), {
    score: 100,
    totalColors: 0,
    pairs: [],
    recommendations: [],
  });
  const motor = safe(() => runMotorAnalysis(ctx), {
    score: 100,
    targets: [],
    gestureIssues: [],
    recommendations: [],
  });
  const hearing = safe(() => runHearingAnalysis(ctx), {
    score: 100,
    media: [],
    recommendations: [],
  });
  const screenReader = safe(() => runScreenReaderSimulation(ctx), {
    score: 100,
    items: [],
    problems: [],
  });
  const keyboard = safe(() => runKeyboardSimulation(ctx), {
    score: 100,
    stops: [],
    issues: [],
  });
  const cognitive = safe(() => runCognitiveExperience(ctx), {
    score: 100,
    metrics: [],
    recommendations: [],
  });
  const motion = safe(() => runMotionExperience(ctx), {
    score: 100,
    items: [],
    recommendations: [],
  });

  const parts = {
    visual,
    color,
    motor,
    hearing,
    screenReader,
    keyboard,
    cognitive,
    motion,
  };

  return {
    generatedAt: Date.now(),
    ...parts,
    summary: generateSummary(parts),
    meta: {
      nodeCount: snapshot.nodeCount,
      documentName: snapshot.documentName,
      pageName: snapshot.pageName,
    },
  };
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function fallbackScored() {
  return { score: 100, lowContrastRatio: 0, recommendations: [] };
}
