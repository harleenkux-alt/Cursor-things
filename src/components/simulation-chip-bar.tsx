"use client";

import { simulations } from "@/lib/simulations/catalog";
import type { SimulationCategory } from "@/lib/simulations/types";
import { cn } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

const categories: SimulationCategory[] = ["Visual", "Cognitive", "Motor"];

export function SimulationChipBar() {
  const { selectedSimulation, selectSimulation, isSimulating } = useSimulatorStore();

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4">
      <div className="space-y-4">
        {categories.map((category) => {
          const options = simulations.filter((simulation) => simulation.category === category);

          return (
            <div key={category}>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {category}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {options.map((simulation) => {
                  const isActive = selectedSimulation === simulation.id;

                  return (
                    <button
                      key={simulation.id}
                      type="button"
                      disabled={isSimulating}
                      onClick={() => void selectSimulation(simulation.id)}
                      className={cn(
                        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
                        isActive
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                          : "border-[var(--border)] bg-white/70 text-[var(--foreground)] hover:bg-white"
                      )}
                    >
                      {simulation.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
