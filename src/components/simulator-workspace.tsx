"use client";

import { AppHeader } from "@/components/app-header";
import { ComparisonPanel } from "@/components/comparison-panel";
import { InsightsSection } from "@/components/insights-section";
import { SimulationSelector } from "@/components/simulation-selector";
import { UploadBar } from "@/components/upload-bar";
import { useSimulatorStore } from "@/store/use-simulator-store";

export function SimulatorWorkspace() {
  const imageUrl = useSimulatorStore((state) => state.imageUrl);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-5 py-6 sm:px-8">
        <UploadBar />

        {imageUrl ? (
          <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
            <aside>
              <SimulationSelector variant="sidebar" />
            </aside>
            <div className="min-w-0 space-y-6">
              <ComparisonPanel />
              <InsightsSection />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ComparisonPanel />
            <InsightsSection />
          </div>
        )}
      </main>
    </>
  );
}
