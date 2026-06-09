"use client";

import { AppHeader } from "@/components/app-header";
import { ComparisonPanel } from "@/components/comparison-panel";
import { InsightsSection } from "@/components/insights-section";
import { SimulationGrid } from "@/components/simulation-grid";
import { UploadBar } from "@/components/upload-bar";

export function SimulatorWorkspace() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-6 sm:px-8">
        <UploadBar />
        <SimulationGrid />
        <ComparisonPanel />
        <InsightsSection />
      </main>
    </>
  );
}
