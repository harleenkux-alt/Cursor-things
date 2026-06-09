"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSimulatorStore } from "@/store/use-simulator-store";

const priorityTone = {
  High: "risk",
  Medium: "warn",
  Low: "good"
} as const;

export function RecommendationsPanel() {
  const { recommendations, isAnalyzing } = useSimulatorStore();

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="font-serif mb-4 text-lg font-bold">Design recommendations</h2>

      {isAnalyzing ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted-foreground)]">
          Processing recommendations...
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {recommendations.map((recommendation) => (
            <article key={recommendation.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold">{recommendation.title}</h3>
                <Badge tone={priorityTone[recommendation.priority]}>{recommendation.priority}</Badge>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{recommendation.rationale}</p>
              <p className="mt-3 rounded-xl bg-[var(--accent-soft)] p-3 text-xs font-medium leading-5">
                {recommendation.action}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted-foreground)]">
          Upload a screen and pick a simulation to get recommendations.
        </div>
      )}
    </section>
  );
}
