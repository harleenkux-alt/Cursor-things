"use client";

import { Download, Loader2, ScanSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { simulationById } from "@/lib/simulations/catalog";
import { useSimulatorStore } from "@/store/use-simulator-store";

export function ComparisonPanel() {
  const [slider, setSlider] = useState(50);
  const { imageUrl, selectedSimulation, result, isSimulating, error } = useSimulatorStore();
  const simulation = simulationById[selectedSimulation];
  const clipPath = useMemo(() => `inset(0 ${100 - slider}% 0 0)`, [slider]);

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
    <Card className="min-h-[42rem]">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Before / after comparison</CardTitle>
            <CardDescription>
              Drag the slider to compare the original upload with the {simulation.name.toLowerCase()} simulation.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge>{simulation.category}</Badge>
            <Badge tone={result ? "good" : "neutral"}>{result ? "Generated" : "Awaiting upload"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#191d1b]">
          {imageUrl ? (
            <div className="relative mx-auto flex min-h-[34rem] items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Original uploaded interface" className="max-h-[70vh] w-full object-contain" />
              {result ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.dataUrl}
                    alt={`${simulation.name} accessibility simulation`}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ clipPath }}
                  />
                  <div className="pointer-events-none absolute inset-y-0" style={{ left: `${slider}%` }}>
                    <div className="h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#17201d] shadow-lg">
                      {slider}%
                    </div>
                  </div>
                </>
              ) : null}
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
            <div className="flex min-h-[34rem] flex-col items-center justify-center p-8 text-center text-white">
              <ScanSearch aria-hidden="true" className="mb-4 text-white/70" size={42} />
              <h3 className="text-xl font-bold">Upload a screen to start simulating inclusion gaps</h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/68">
                The MVP supports cataracts, glaucoma, low vision, color blindness, ADHD, dyslexia, tremors, and limited
                precision.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <label htmlFor="comparison-slider" className="text-sm font-semibold">
              Simulation reveal
            </label>
            <input
              id="comparison-slider"
              type="range"
              min="0"
              max="100"
              value={slider}
              onChange={(event) => setSlider(Number(event.target.value))}
              className="mt-3 w-full accent-[var(--primary)]"
              disabled={!result}
            />
            <div className="mt-1 flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>Original</span>
              <span>Simulation</span>
            </div>
          </div>
          <Button type="button" onClick={download} disabled={!result}>
            <Download aria-hidden="true" size={16} />
            Download simulation
          </Button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
