"use client";

import { AlertTriangle, CheckCircle2, Info, Loader2, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyzerSeverity } from "@/lib/simulations/types";
import { validateContrastScore } from "@/lib/validation/scorecard";
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

  const contrast = report ? validateContrastScore(report.contrastScore, true) : null;

  return (
    <Card className="h-full border-0 bg-transparent shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Accessibility scorecard</CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/55 p-4 text-sm font-semibold">
            <Loader2 aria-hidden="true" className="animate-spin" size={16} />
            Processing metrics...
          </div>
        ) : report ? (
          <>
            {report.validationWarnings?.map((warning) => (
              <div
                key={warning}
                className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900"
              >
                {warning}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <Score label="Contrast" value={contrast?.value ?? report.contrastScore} error={contrast?.error} />
              <Score label="Readability" value={report.readabilityScore} />
              <Score label="Density" value={report.densityScore} />
              <Score label="Touch targets" value={report.touchTargetScore} />
            </div>

            <div className="mt-4 rounded-xl border border-[var(--border)] bg-white/55 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                <Ruler aria-hidden="true" size={14} />
                Image metadata
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <Meta label="Size" value={`${report.imageMeta.width} × ${report.imageMeta.height}`} />
                <Meta label="File" value={formatBytes(report.imageMeta.fileSize)} />
              </dl>
            </div>

            <div className="mt-4 space-y-2">
              {report.findings.slice(0, 3).map((finding) => {
                const Icon = severityIcon[finding.severity];

                return (
                  <div key={finding.id} className="rounded-xl border border-[var(--border)] bg-white/55 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2">
                        <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--primary)]" size={15} />
                        <div>
                          <div className="text-sm font-semibold">{finding.label}</div>
                          <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">{finding.explanation}</p>
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
          <div className="rounded-xl border border-[var(--border)] bg-white/55 p-4 text-sm text-[var(--muted-foreground)]">
            Upload a screenshot to see contrast, density, and readability scores.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Score({ label, value, error }: { label: string; value: number; error?: string }) {
  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
        <div className="mt-2 text-sm font-semibold text-amber-900">Processing failed</div>
        <p className="mt-1 text-xs text-amber-800">{error}</p>
      </div>
    );
  }

  const rounded = Math.round(value);
  const tone = rounded >= 76 ? "bg-[var(--primary)]" : rounded >= 58 ? "bg-[var(--highlight)]" : "bg-red-500";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 text-2xl font-black">{rounded}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className={`h-full ${tone}`} style={{ width: `${rounded}%` }} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
