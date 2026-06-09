"use client";

import { Brain, Eye, MousePointer2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { simulations } from "@/lib/simulations/catalog";
import type { SimulationCategory } from "@/lib/simulations/types";
import { cn } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

const categoryIcons: Record<SimulationCategory, typeof Eye> = {
  Visual: Eye,
  Cognitive: Brain,
  Motor: MousePointer2
};

export function SimulationSelector() {
  const { selectedSimulation, selectSimulation, imageUrl, isSimulating } = useSimulatorStore();
  const categories: SimulationCategory[] = ["Visual", "Cognitive", "Motor"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a simulation</CardTitle>
        <CardDescription>
          Simulations are intentionally experiential: they show design risk, then pair it with recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const options = simulations.filter((simulation) => simulation.category === category);

            return (
              <div key={category}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon aria-hidden="true" size={16} className="text-[var(--primary)]" />
                  <h3 className="text-sm font-bold">{category}</h3>
                </div>
                <div className="grid gap-2">
                  {options.map((simulation) => {
                    const isSelected = selectedSimulation === simulation.id;

                    return (
                      <button
                        key={simulation.id}
                        type="button"
                        disabled={isSimulating}
                        onClick={() => void selectSimulation(simulation.id)}
                        className={cn(
                          "rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60",
                          isSelected
                            ? "border-[var(--primary)] bg-[#eaf4ef] shadow-sm"
                            : "border-[var(--border)] bg-white/55 hover:bg-white"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{simulation.name}</div>
                            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                              {simulation.summary}
                            </p>
                          </div>
                          {isSelected ? <Badge tone="good">{imageUrl ? "Active" : "Ready"}</Badge> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
