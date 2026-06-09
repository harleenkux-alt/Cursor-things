"use client";

import { create } from "zustand";
import { analyzeImage } from "@/lib/accessibility/analyzer";
import { createRecommendations } from "@/lib/accessibility/recommendations";
import { generateSimulation } from "@/lib/simulations/engine";
import type {
  AccessibilityReport,
  DesignRecommendation,
  SimulationId,
  SimulationResult
} from "@/lib/simulations/types";
import { validateSimulationOutput } from "@/lib/validation/simulation";
import { validateUpload } from "@/lib/validation/upload";

const simulationCache = new Map<string, SimulationResult>();

function cacheKey(imageUrl: string, simulation: SimulationId) {
  return `${imageUrl}:${simulation}`;
}

type UploadState = {
  file: File | null;
  imageUrl: string | null;
  selectedSimulation: SimulationId;
  result: SimulationResult | null;
  report: AccessibilityReport | null;
  recommendations: DesignRecommendation[];
  isAnalyzing: boolean;
  isSimulating: boolean;
  error: string | null;
  validationErrors: string[];
  uploadImage: (file: File) => Promise<void>;
  selectSimulation: (simulation: SimulationId) => Promise<void>;
  runSimulation: () => Promise<void>;
  reset: () => void;
};

export const useSimulatorStore = create<UploadState>((set, get) => ({
  file: null,
  imageUrl: null,
  selectedSimulation: "low-vision",
  result: null,
  report: null,
  recommendations: [],
  isAnalyzing: false,
  isSimulating: false,
  error: null,
  validationErrors: [],

  async uploadImage(file) {
    set({ validationErrors: [], error: null });

    const validation = await validateUpload(file);
    if (!validation.valid) {
      set({ validationErrors: validation.errors });
      return;
    }

    const previousUrl = get().imageUrl;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    simulationCache.clear();

    const imageUrl = URL.createObjectURL(file);
    set({
      file,
      imageUrl,
      result: null,
      report: null,
      recommendations: [],
      isAnalyzing: true,
      error: null,
      validationErrors: []
    });

    try {
      const report = await analyzeImage(file, imageUrl);
      set({
        report,
        recommendations: createRecommendations(report, get().selectedSimulation),
        isAnalyzing: false
      });
      await get().runSimulation();
    } catch (uploadError) {
      set({
        isAnalyzing: false,
        error: uploadError instanceof Error ? uploadError.message : "Unable to analyze this image."
      });
    }
  },

  async selectSimulation(simulation) {
    set({
      selectedSimulation: simulation,
      result: null,
      recommendations: createRecommendations(get().report, simulation),
      error: null
    });

    if (get().imageUrl) {
      await get().runSimulation();
    }
  },

  async runSimulation() {
    const { imageUrl, selectedSimulation, report } = get();
    if (!imageUrl) {
      return;
    }

    const key = cacheKey(imageUrl, selectedSimulation);
    const cached = simulationCache.get(key);
    if (cached) {
      set({
        result: cached,
        recommendations: createRecommendations(report, selectedSimulation),
        isSimulating: false,
        error: null
      });
      return;
    }

    set({ isSimulating: true, error: null });

    try {
      const result = await generateSimulation(imageUrl, selectedSimulation);
      await validateSimulationOutput(imageUrl, result.dataUrl);
      simulationCache.set(key, result);
      set({
        result,
        recommendations: createRecommendations(report, selectedSimulation),
        isSimulating: false,
        error: null
      });
    } catch (simulationError) {
      set({
        isSimulating: false,
        error:
          simulationError instanceof Error
            ? simulationError.message.replace("Simulation validation failed: ", "Simulation failed: ")
            : "Unable to generate this simulation."
      });
    }
  },

  reset() {
    const previousUrl = get().imageUrl;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    simulationCache.clear();
    set({
      file: null,
      imageUrl: null,
      result: null,
      report: null,
      recommendations: [],
      isAnalyzing: false,
      isSimulating: false,
      error: null,
      validationErrors: []
    });
  }
}));
