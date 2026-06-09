"use client";

import { RecommendationsPanel } from "@/components/recommendations-panel";
import { ReportPanel } from "@/components/report-panel";

export function InsightsSection() {
  return (
    <section>
      <h2 className="mb-4 text-base font-bold">Insights</h2>
      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <ReportPanel />
        <RecommendationsPanel />
      </div>
    </section>
  );
}
