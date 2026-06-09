"use client";

import { simulations } from "@/lib/simulations/catalog";
import type { SimulationCategory } from "@/lib/simulations/types";
import { cn } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

const categories: SimulationCategory[] = ["Visual", "Cognitive", "Motor"];

export function SimulationChipBar() {
  const { selectedSimulation, selectSimulation, isSimulating } = useSimulatorStore();

  return (
    <section className="space-y-3">
      {categories.map((category) => {
        const options = simulations.filter((simulation) => simulation.category === category);

        return (
          <div key={category}>
            <div className="mb-2 text-sm font-semibold lowercase text-[var(--foreground)]">{category}</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {options.map((simulation) => {
                const isActive = selectedSimulation === simulation.id;

                return (
                  <button
                    key={simulation.id}
                    type="button"
                    disabled={isSimulating}
                    title={simulation.name}
                    onClick={() => void selectSimulation(simulation.id)}
                    className={cn(
                      "h-10 shrink-0 rounded-lg border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                        : "border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-white"
                    )}
                  >
                    {simulation.chipLabel ?? simulation.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
