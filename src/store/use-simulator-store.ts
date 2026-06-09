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

  async uploadImage(file) {
    if (!file.type.startsWith("image/")) {
      set({ error: "Upload a PNG, JPG, or WebP screenshot." });
      return;
    }

    const previousUrl = get().imageUrl;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    const imageUrl = URL.createObjectURL(file);
    set({
      file,
      imageUrl,
      result: null,
      report: null,
      recommendations: [],
      isAnalyzing: true,
      error: null
    });

    try {
      const report = await analyzeImage(file, imageUrl);
      set({
        report,
        recommendations: createRecommendations(report, get().selectedSimulation),
        isAnalyzing: false
      });
      await get().runSimulation();
    } catch (error) {
      set({
        isAnalyzing: false,
        error: error instanceof Error ? error.message : "Unable to analyze this image."
      });
    }
  },

  async selectSimulation(simulation) {
    set({
      selectedSimulation: simulation,
      result: null,
      recommendations: createRecommendations(get().report, simulation)
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

    set({ isSimulating: true, error: null });

    try {
      const result = await generateSimulation(imageUrl, selectedSimulation);
      set({
        result,
        recommendations: createRecommendations(report, selectedSimulation),
        isSimulating: false
      });
    } catch (error) {
      set({
        isSimulating: false,
        error: error instanceof Error ? error.message : "Unable to generate this simulation."
      });
    }
  },

  reset() {
    const previousUrl = get().imageUrl;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    set({
      file: null,
      imageUrl: null,
      result: null,
      report: null,
      recommendations: [],
      isAnalyzing: false,
      isSimulating: false,
      error: null
    });
  }
}));
