"use client";

import { Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonEmptyState } from "@/components/comparison-empty-state";
import { simulationById } from "@/lib/simulations/catalog";
import { useSimulatorStore } from "@/store/use-simulator-store";

export function ComparisonPanel() {
  const { imageUrl, selectedSimulation, result, isSimulating, error } = useSimulatorStore();
  const simulation = simulationById[selectedSimulation];

  const download = () => {
    if (!result) {
      return;
    }

    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = `inclusive-design-${selectedSimulation}.png`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Before / after comparison</CardTitle>
            <CardDescription>
              Compare your upload with the {simulation.name.toLowerCase()} simulation.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge>{simulation.category}</Badge>
            <Badge tone={result ? "good" : "neutral"}>{result ? "Generated" : "Awaiting upload"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {imageUrl ? (
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#191d1b]">
            {result ? (
              <div className="grid min-h-[28rem] grid-cols-2">
                <div className="relative flex items-center justify-center border-r border-white/10">
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white">
                    Original
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Original uploaded interface" className="max-h-[60vh] w-full object-contain" />
                </div>
                <div className="relative flex items-center justify-center">
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">
                    {simulation.name}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.dataUrl}
                    alt={`${simulation.name} accessibility simulation`}
                    className="max-h-[60vh] w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="relative flex min-h-[28rem] items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Original uploaded interface" className="max-h-[60vh] w-full object-contain" />
              </div>
            )}

            {isSimulating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/42 text-white backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-full bg-black/55 px-5 py-3 text-sm font-semibold">
                  <Loader2 aria-hidden="true" className="animate-spin" size={18} />
                  Generating simulation...
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <ComparisonEmptyState />
        )}

        {imageUrl && result ? (
          <div className="mt-5 flex justify-end">
            <Button type="button" onClick={download}>
              <Download aria-hidden="true" size={16} />
              Download simulation
            </Button>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
