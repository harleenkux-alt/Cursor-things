"use client";

import {
  Brain,
  Eye,
  EyeOff,
  Hand,
  Layers,
  MousePointer2,
  Sparkles,
  Sun,
  type LucideIcon
} from "lucide-react";
import { simulations } from "@/lib/simulations/catalog";
import type { SimulationCategory, SimulationId } from "@/lib/simulations/types";
import { cn } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

const categoryIcons: Record<SimulationCategory, LucideIcon> = {
  Visual: Eye,
  Cognitive: Brain,
  Motor: MousePointer2
};

const simulationIcons: Record<SimulationId, LucideIcon> = {
  "low-vision": Eye,
  deuteranopia: Layers,
  protanopia: Layers,
  cataracts: EyeOff,
  "glare-sensitivity": Sun,
  adhd: Sparkles,
  "cognitive-load": Brain,
  "reading-difficulty": Brain,
  tremors: MousePointer2,
  "one-hand-navigation": Hand
};

const categories: SimulationCategory[] = ["Visual", "Cognitive", "Motor"];

export function SimulationGrid() {
  const { selectedSimulation, selectSimulation, isSimulating } = useSimulatorStore();

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
      <h2 className="mb-4 text-base font-bold">Choose a simulation</h2>

      <div className="space-y-5">
        {categories.map((category) => {
          const CategoryIcon = categoryIcons[category];
          const options = simulations.filter((simulation) => simulation.category === category);

          return (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)]">
                <CategoryIcon aria-hidden="true" size={16} />
                {category}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {options.map((simulation) => {
                  const Icon = simulationIcons[simulation.id];
                  const isActive = selectedSimulation === simulation.id;

                  return (
                    <button
                      key={simulation.id}
                      type="button"
                      disabled={isSimulating}
                      onClick={() => void selectSimulation(simulation.id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
                        isActive
                          ? "border-[var(--accent)] bg-[#fdf0ea] shadow-sm"
                          : "border-[var(--border)] bg-white hover:border-[var(--primary)]/30 hover:bg-[#fdf6ef]"
                      )}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div
                          className={cn(
                            "rounded-lg p-2",
                            isActive ? "bg-[var(--accent)] text-white" : "bg-[var(--muted)] text-[var(--primary)]"
                          )}
                        >
                          <Icon aria-hidden="true" size={18} />
                        </div>
                        {isActive ? (
                          <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <div className="font-semibold">{simulation.chipLabel ?? simulation.name}</div>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{simulation.summary}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
