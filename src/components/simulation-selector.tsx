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

type SimulationSelectorProps = {
  variant?: "bar" | "grid";
};

export function SimulationSelector({ variant = "bar" }: SimulationSelectorProps) {
  const { selectedSimulation, selectSimulation, isSimulating } = useSimulatorStore();
  const isBar = variant === "bar";

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="font-serif mb-4 text-lg font-bold">Choose a simulation</h2>

      <div className="space-y-4">
        {categories.map((category) => {
          const CategoryIcon = categoryIcons[category];
          const options = simulations.filter((simulation) => simulation.category === category);

          return (
            <div key={category}>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                <CategoryIcon aria-hidden="true" size={14} strokeWidth={1.5} />
                {category}
              </div>
              <div
                className={cn(
                  "flex gap-2",
                  isBar ? "overflow-x-auto pb-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
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
                        "shrink-0 rounded-full border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
                        isBar ? "inline-flex items-center gap-2 px-4 py-2" : "rounded-xl p-4 text-left",
                        isActive
                          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                          : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40"
                      )}
                    >
                      {isBar ? (
                        <>
                          <Icon aria-hidden="true" size={15} strokeWidth={1.5} />
                          {simulation.chipLabel ?? simulation.name}
                        </>
                      ) : (
                        <>
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div
                              className={cn(
                                "rounded-full p-2",
                                isActive ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"
                              )}
                            >
                              <Icon aria-hidden="true" size={18} strokeWidth={1.5} />
                            </div>
                          </div>
                          <div className="font-semibold">{simulation.chipLabel ?? simulation.name}</div>
                          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{simulation.summary}</p>
                        </>
                      )}
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
