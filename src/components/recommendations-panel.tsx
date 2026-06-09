"use client";

import { Lightbulb, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Design recommendations</CardTitle>
            <CardDescription>
              Recommendations connect the simulation to concrete design-system and product decisions.
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-[var(--muted)] p-3 text-[var(--primary)]">
            <Lightbulb aria-hidden="true" size={21} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <article key={recommendation.id} className="rounded-2xl border border-[var(--border)] bg-white/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold">{recommendation.title}</h3>
                  <Badge tone={priorityTone[recommendation.priority]}>{recommendation.priority}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{recommendation.rationale}</p>
                <div className="mt-3 rounded-xl bg-[#f3ece1] p-3 text-sm font-medium leading-6">
                  {recommendation.action}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-white/55 p-4 text-sm text-[var(--muted-foreground)]">
            Select a simulation and upload a screen to generate prioritized improvements.
          </div>
        )}

        <div className="mt-4 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
          <p>
            Simulations are approximations. Use them to build empathy, find product risks, and prioritize research with
            disabled users.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
