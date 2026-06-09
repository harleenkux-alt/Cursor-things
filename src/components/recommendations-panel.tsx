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
  const { recommendations } = useSimulatorStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Design recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <article key={recommendation.id} className="rounded-xl border border-[var(--border)] bg-white/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold">{recommendation.title}</h3>
                  <Badge tone={priorityTone[recommendation.priority]}>{recommendation.priority}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{recommendation.action}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-white/55 p-4 text-sm text-[var(--muted-foreground)]">
            Upload a screen and pick a simulation to get recommendations.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
