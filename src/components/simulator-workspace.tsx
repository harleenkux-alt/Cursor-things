"use client";

import { AppHeader } from "@/components/app-header";
import { ComparisonPanel } from "@/components/comparison-panel";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { ReportPanel } from "@/components/report-panel";
import { SimulationSelector } from "@/components/simulation-selector";
import { UploadBar } from "@/components/upload-bar";
import { useSimulatorStore } from "@/store/use-simulator-store";

export function SimulatorWorkspace() {
  const imageUrl = useSimulatorStore((state) => state.imageUrl);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <UploadBar />

        {imageUrl ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-6">
              <SimulationSelector variant="bar" />
              <ComparisonPanel />
              <RecommendationsPanel />
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <ReportPanel />
            </aside>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <ComparisonPanel />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <RecommendationsPanel />
              <ReportPanel />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
