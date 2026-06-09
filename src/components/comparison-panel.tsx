"use client";

import { Columns2, Download, Loader2, ScanSearch, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { simulationById } from "@/lib/simulations/catalog";
import { cn } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

type ComparisonMode = "slider" | "side-by-side";

export function ComparisonPanel() {
  const [slider, setSlider] = useState(50);
  const [mode, setMode] = useState<ComparisonMode>("side-by-side");
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
              Compare the original upload with the {simulation.name.toLowerCase()} simulation side by side or with a
              reveal slider.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge>{simulation.category}</Badge>
            <Badge tone={result ? "good" : "neutral"}>{result ? "Generated" : "Awaiting upload"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {imageUrl && result ? (
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("side-by-side")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                mode === "side-by-side"
                  ? "border-[var(--primary)] bg-[#eaf4ef] text-[var(--primary)]"
                  : "border-[var(--border)] bg-white/55 hover:bg-white"
              )}
            >
              <Columns2 aria-hidden="true" size={15} />
              Side by side
            </button>
            <button
              type="button"
              onClick={() => setMode("slider")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                mode === "slider"
                  ? "border-[var(--primary)] bg-[#eaf4ef] text-[var(--primary)]"
                  : "border-[var(--border)] bg-white/55 hover:bg-white"
              )}
            >
              <SlidersHorizontal aria-hidden="true" size={15} />
              Reveal slider
            </button>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[#191d1b]">
          {imageUrl ? (
            mode === "side-by-side" && result ? (
              <div className="grid min-h-[34rem] grid-cols-2">
                <div className="relative flex items-center justify-center border-r border-white/10">
                  <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white">
                    Original
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Original uploaded interface" className="max-h-[70vh] w-full object-contain" />
                </div>
                <div className="relative flex items-center justify-center">
                  <span className="absolute left-4 top-4 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">
                    {simulation.name}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.dataUrl}
                    alt={`${simulation.name} accessibility simulation`}
                    className="max-h-[70vh] w-full object-contain"
                  />
                </div>
              </div>
            ) : (
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
            )
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
          {mode === "slider" ? (
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
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Original on the left, {simulation.name.toLowerCase()} simulation on the right. Switch to reveal slider for
              a gradual before/after comparison.
            </p>
          )}
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
