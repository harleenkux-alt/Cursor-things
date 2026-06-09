export type SimulationCategory = "Visual" | "Cognitive" | "Motor";

export type SimulationId =
  | "low-vision"
  | "deuteranopia"
  | "protanopia"
  | "cataracts"
  | "glare-sensitivity"
  | "adhd"
  | "cognitive-load"
  | "reading-difficulty"
  | "tremors"
  | "one-hand-navigation";

export type SimulationDefinition = {
  id: SimulationId;
  name: string;
  category: SimulationCategory;
  summary: string;
  designRisk: string;
};

export type SimulationResult = {
  dataUrl: string;
  generatedAt: string;
};

export type AnalyzerSeverity = "good" | "warning" | "critical";

export type AccessibilityFinding = {
  id: string;
  label: string;
  value: string;
  severity: AnalyzerSeverity;
  explanation: string;
};

export type AccessibilityReport = {
  contrastScore: number;
  readabilityScore: number;
  densityScore: number;
  touchTargetScore: number;
  findings: AccessibilityFinding[];
  imageMeta: {
    width: number;
    height: number;
    fileSize: number;
    averageLuminance: number;
    tonalRange?: number;
  };
};

export type DesignRecommendation = {
  id: string;
  title: string;
  rationale: string;
  action: string;
  priority: "High" | "Medium" | "Low";
};
