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
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <UploadBar />

        {imageUrl ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)_22rem]">
            <aside className="decorative-pattern rounded-2xl p-4 lg:sticky lg:top-6 lg:self-start">
              <SimulationSelector variant="sidebar" />
            </aside>

            <div className="workspace-panel min-w-0 rounded-2xl p-1">
              <ComparisonPanel />
            </div>

            <aside className="decorative-pattern space-y-5 rounded-2xl p-4 lg:sticky lg:top-6 lg:self-start">
              <InsightsSection variant="sidebar" />
            </aside>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="workspace-panel rounded-2xl">
              <ComparisonPanel />
            </div>
            <InsightsSection />
          </div>
        )}
      </main>
    </>
  );
}
