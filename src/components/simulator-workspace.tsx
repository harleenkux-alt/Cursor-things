"use client";

import { ComparisonPanel } from "@/components/comparison-panel";
import { ImageUploader } from "@/components/image-uploader";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { ReportPanel } from "@/components/report-panel";
import { SimulationSelector } from "@/components/simulation-selector";

export function SimulatorWorkspace() {
  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-5 pb-12 sm:px-8 lg:grid-cols-[22rem_1fr_24rem] lg:px-10">
      <aside className="space-y-5">
        <ImageUploader />
        <SimulationSelector />
      </aside>

      <ComparisonPanel />

      <aside className="space-y-5">
        <ReportPanel />
        <RecommendationsPanel />
      </aside>
    </main>
  );
}
