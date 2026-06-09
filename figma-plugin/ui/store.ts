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

const simulationCache = new Map<string, SimulationResult>();

function cacheKey(imageUrl: string, simulation: SimulationId) {
  return `${imageUrl}:${simulation}`;
}

type FramePayload = {
  imageBase64: string;
  frameName: string;
  width: number;
  height: number;
  fileSize: number;
};

type PluginState = {
  frameName: string | null;
  imageUrl: string | null;
  file: File | null;
  selectedSimulation: SimulationId;
  result: SimulationResult | null;
  report: AccessibilityReport | null;
  recommendations: DesignRecommendation[];
  isAnalyzing: boolean;
  isSimulating: boolean;
  error: string | null;
  selectionHint: string;
  loadFrame: (payload: FramePayload) => Promise<void>;
  selectSimulation: (simulation: SimulationId) => Promise<void>;
  runSimulation: () => Promise<void>;
  clearFrame: () => void;
  setSelectionHint: (hint: string) => void;
  setError: (error: string | null) => void;
};

export const usePluginStore = create<PluginState>((set, get) => ({
  frameName: null,
  imageUrl: null,
  file: null,
  selectedSimulation: "low-vision",
  result: null,
  report: null,
  recommendations: [],
  isAnalyzing: false,
  isSimulating: false,
  error: null,
  selectionHint: "Select a frame in Figma to begin.",

  setSelectionHint(hint) {
    set({ selectionHint: hint });
  },

  setError(error) {
    set({ error });
  },

  clearFrame() {
    const previousUrl = get().imageUrl;
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    simulationCache.clear();
    set({
      frameName: null,
      imageUrl: null,
      file: null,
      result: null,
      report: null,
      recommendations: [],
      isAnalyzing: false,
      isSimulating: false,
      error: null,
      selectionHint: "Select a frame in Figma to begin."
    });
  },

  async loadFrame(payload) {
    const previousUrl = get().imageUrl;
    if (previousUrl && previousUrl !== payload.imageBase64) {
      URL.revokeObjectURL(previousUrl);
    }

    simulationCache.clear();

    const response = await fetch(payload.imageBase64);
    const blob = await response.blob();
    const file = new File([blob], `${payload.frameName}.png`, { type: "image/png" });
    const imageUrl = payload.imageBase64;

    set({
      frameName: payload.frameName,
      file,
      imageUrl,
      result: null,
      report: null,
      recommendations: [],
      isAnalyzing: true,
      error: null,
      selectionHint: `Simulating: ${payload.frameName}`
    });

    try {
      const report = await analyzeImage(file, imageUrl);
      set({
        report,
        recommendations: createRecommendations(report, get().selectedSimulation),
        isAnalyzing: false
      });
      await get().runSimulation();
    } catch (loadError) {
      set({
        isAnalyzing: false,
        error: loadError instanceof Error ? loadError.message : "Unable to analyze this frame."
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
  }
}));
