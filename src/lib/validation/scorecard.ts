import type { AccessibilityReport } from "@/lib/simulations/types";

type ScoreKey = "contrastScore" | "readabilityScore" | "densityScore" | "touchTargetScore";

const METRIC_RANGES: Record<ScoreKey, { min: number; max: number }> = {
  contrastScore: { min: 0, max: 100 },
  readabilityScore: { min: 0, max: 100 },
  densityScore: { min: 0, max: 100 },
  touchTargetScore: { min: 0, max: 100 }
};

export type ValidatedScore =
  | { value: number; error?: undefined }
  | { value: null; error: string };

export function validateContrastScore(score: number, hasImage: boolean): ValidatedScore {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return { value: null, error: "Contrast detection failed. Try another image." };
  }

  if (score === 0 && hasImage) {
    return { value: null, error: "Contrast detection failed. Try another image." };
  }

  return { value: score };
}

export function validateScorecard(report: AccessibilityReport): string[] {
  const issues: string[] = [];

  (Object.keys(METRIC_RANGES) as ScoreKey[]).forEach((key) => {
    const value = report[key];
    const range = METRIC_RANGES[key];

    if (!Number.isFinite(value) || value < range.min || value > range.max) {
      issues.push(`${key} out of range: ${value}`);
    }
  });

  const contrast = validateContrastScore(report.contrastScore, true);
  if (contrast.error) {
    issues.push(contrast.error);
  }

  return issues;
}

export function sanitizeReport(report: AccessibilityReport): AccessibilityReport {
  const contrast = validateContrastScore(report.contrastScore, true);

  return {
    ...report,
    contrastScore: contrast.value ?? (report.readabilityScore > 0 ? Math.max(report.readabilityScore * 0.6, 15) : 15),
    readabilityScore: clampMetric(report.readabilityScore),
    densityScore: clampMetric(report.densityScore),
    touchTargetScore: clampMetric(report.touchTargetScore),
    validationWarnings: contrast.error ? [contrast.error] : undefined
  };
}

function clampMetric(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
}
