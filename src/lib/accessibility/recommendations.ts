import type { AccessibilityReport, DesignRecommendation, SimulationId } from "@/lib/simulations/types";

const simulationGuidance: Partial<Record<SimulationId, DesignRecommendation[]>> = {
  cataracts: [
    {
      id: "cataracts-contrast",
      title: "Increase foreground/background contrast",
      rationale: "Cataracts reduce contrast sensitivity and add visual haze.",
      action: "Use stronger text colors, avoid pale gray UI copy, and keep critical borders visible.",
      priority: "High"
    },
    {
      id: "cataracts-scale",
      title: "Make fine details less essential",
      rationale: "Blur and yellowing make thin icons, faint dividers, and dense data points harder to parse.",
      action: "Pair icon-only states with labels and increase minimum text size to 16px or higher.",
      priority: "Medium"
    }
  ],
  glaucoma: [
    {
      id: "glaucoma-critical-center",
      title: "Keep critical status and next actions in the main task path",
      rationale: "Peripheral loss means edge-positioned alerts and navigation may be missed.",
      action: "Repeat high-risk messages near the relevant content, not only in sidebars or corners.",
      priority: "High"
    }
  ],
  "low-vision": [
    {
      id: "low-vision-hierarchy",
      title: "Strengthen hierarchy through size, spacing, and weight",
      rationale: "Low acuity compresses small visual differences.",
      action: "Use larger headings, clear grouping, and avoid relying on subtle shade changes.",
      priority: "High"
    }
  ],
  protanopia: [
    {
      id: "protanopia-status",
      title: "Do not communicate status with red/green alone",
      rationale: "Red-light deficiency can collapse common error/success palettes.",
      action: "Add labels, icons, patterns, or position cues to status indicators.",
      priority: "High"
    }
  ],
  deuteranopia: [
    {
      id: "deuteranopia-status",
      title: "Add redundant cues to color-coded decisions",
      rationale: "Green-light deficiency can make dashboards and forms ambiguous.",
      action: "Combine color with text, shape, and contrast-tested iconography.",
      priority: "High"
    }
  ],
  tritanopia: [
    {
      id: "tritanopia-palette",
      title: "Review blue/yellow data palettes",
      rationale: "Tritanopia affects blue/yellow distinction and can flatten charts.",
      action: "Choose palettes with luminance contrast and direct labels on chart marks.",
      priority: "Medium"
    }
  ],
  adhd: [
    {
      id: "adhd-focus",
      title: "Reduce competing attention magnets",
      rationale: "Motion, badges, ads, and repeated CTAs fragment task focus.",
      action: "Limit simultaneous highlights and make one primary action visually dominant.",
      priority: "High"
    }
  ],
  dyslexia: [
    {
      id: "dyslexia-reading",
      title: "Support scanning and reduce reading fatigue",
      rationale: "Dense text and tight spacing increase effort for dyslexic readers.",
      action: "Use short paragraphs, generous line height, left alignment, and plain-language labels.",
      priority: "High"
    }
  ],
  tremors: [
    {
      id: "tremors-targets",
      title: "Increase target size and spacing",
      rationale: "Pointer instability makes small adjacent controls error-prone.",
      action: "Use at least 44x44px hit areas and keep destructive actions separated.",
      priority: "High"
    }
  ],
  "limited-precision": [
    {
      id: "limited-precision-forgiveness",
      title: "Design forgiving interactions",
      rationale: "Users with limited precision need tolerance for imprecise taps and clicks.",
      action: "Increase hit areas, add undo for destructive actions, and avoid tiny hover-only controls.",
      priority: "High"
    }
  ]
};

export function createRecommendations(
  report: AccessibilityReport | null,
  simulation: SimulationId | null
): DesignRecommendation[] {
  const recommendations: DesignRecommendation[] = [];

  if (simulation) {
    recommendations.push(...(simulationGuidance[simulation] ?? []));
  }

  if (report) {
    if (report.contrastScore < 72) {
      recommendations.push({
        id: "report-contrast",
        title: "Raise contrast before visual polish",
        rationale: "The scorecard found weak local luminance separation.",
        action: "Target WCAG AA ratios for body text and use stronger borders for inputs and cards.",
        priority: "High"
      });
    }

    if (report.densityScore < 70) {
      recommendations.push({
        id: "report-density",
        title: "Simplify content hierarchy",
        rationale: "The uploaded screen appears visually dense.",
        action: "Group related content, remove secondary decoration, and expose progressive detail only when needed.",
        priority: "Medium"
      });
    }

    if (report.touchTargetScore < 72) {
      recommendations.push({
        id: "report-touch-targets",
        title: "Audit touch and click targets",
        rationale: "Clustered visual elements may translate into small or crowded controls.",
        action: "Set a minimum 44x44px target, add spacing between controls, and make cards clickable only when clear.",
        priority: "High"
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "baseline",
      title: "Validate with disabled users",
      rationale: "Simulation is a learning aid, not a substitute for lived experience.",
      action: "Use this result to prioritize moderated accessibility testing and design-system improvements.",
      priority: "Low"
    });
  }

  return dedupeRecommendations(recommendations).slice(0, 5);
}

function dedupeRecommendations(recommendations: DesignRecommendation[]) {
  const seen = new Set<string>();
  return recommendations.filter((recommendation) => {
    if (seen.has(recommendation.title)) {
      return false;
    }
    seen.add(recommendation.title);
    return true;
  });
}
