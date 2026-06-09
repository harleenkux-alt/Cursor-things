"use client";

import { RecommendationsPanel } from "@/components/recommendations-panel";
import { ReportPanel } from "@/components/report-panel";

export function InsightsSection() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <ReportPanel />
      <RecommendationsPanel />
    </section>
  );
}
