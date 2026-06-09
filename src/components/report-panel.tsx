"use client";

import { AlertTriangle, CheckCircle2, Info, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyzerSeverity } from "@/lib/simulations/types";
import { formatBytes } from "@/lib/utils";
import { useSimulatorStore } from "@/store/use-simulator-store";

const severityIcon: Record<AnalyzerSeverity, typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: Info,
  critical: AlertTriangle
};

const severityTone: Record<AnalyzerSeverity, "good" | "warn" | "risk"> = {
  good: "good",
  warning: "warn",
  critical: "risk"
};

export function ReportPanel() {
  const { report, isAnalyzing } = useSimulatorStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility scorecard</CardTitle>
        <CardDescription>
          Screenshot-based analysis estimates contrast, density, reading effort, and target risk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="rounded-2xl border border-[var(--border)] bg-white/55 p-4 text-sm font-semibold">
            Analyzing screenshot...
          </div>
        ) : report ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Score label="Contrast" value={report.contrastScore} />
              <Score label="Readability" value={report.readabilityScore} />
              <Score label="Density" value={report.densityScore} />
              <Score label="Touch targets" value={report.touchTargetScore} />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white/55 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                <Ruler aria-hidden="true" size={16} />
                Image metadata
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Meta label="Size" value={`${report.imageMeta.width} x ${report.imageMeta.height}`} />
                <Meta label="File" value={formatBytes(report.imageMeta.fileSize)} />
                <Meta label="Avg. luminance" value={`${Math.round(report.imageMeta.averageLuminance * 100)}%`} />
                <Meta
                  label="Tonal range"
                  value={report.imageMeta.tonalRange ? `${Math.round(report.imageMeta.tonalRange)}/255` : "Pending"}
                />
              </dl>
            </div>

            <div className="space-y-3">
              {report.findings.map((finding) => {
                const Icon = severityIcon[finding.severity];

                return (
                  <div key={finding.id} className="rounded-2xl border border-[var(--border)] bg-white/55 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <Icon aria-hidden="true" className="mt-0.5 text-[var(--primary)]" size={17} />
                        <div>
                          <div className="font-semibold">{finding.label}</div>
                          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                            {finding.explanation}
                          </p>
                        </div>
                      </div>
                      <Badge tone={severityTone[finding.severity]}>{finding.value}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-[var(--border)] bg-white/55 p-4 text-sm text-[var(--muted-foreground)]">
            Upload a screenshot to generate contrast, font-size, touch-target, dense-content, and reading-complexity
            warnings.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const rounded = Math.round(value);
  const tone = rounded >= 76 ? "bg-emerald-500" : rounded >= 58 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-2 text-2xl font-black">{rounded}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={`h-full ${tone}`} style={{ width: `${rounded}%` }} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
