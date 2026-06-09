"use client";

import { RecommendationsPanel } from "@/components/recommendations-panel";
import { ReportPanel } from "@/components/report-panel";

type InsightsSectionProps = {
  variant?: "default" | "sidebar";
};

export function InsightsSection({ variant = "default" }: InsightsSectionProps) {
  const isSidebar = variant === "sidebar";

  return (
    <section>
      {!isSidebar ? <h2 className="font-serif mb-4 text-xl font-bold">Insights</h2> : null}
      <div className={isSidebar ? "space-y-4" : "grid gap-5 md:grid-cols-2 md:items-start"}>
        <ReportPanel />
        <RecommendationsPanel />
      </div>
    </section>
  );
}
