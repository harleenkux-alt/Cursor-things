"use client";

import { Upload } from "lucide-react";

export function ComparisonEmptyState() {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--border)] bg-white/55 p-8 text-center">
      <div className="mb-4 rounded-2xl bg-[var(--muted)] p-4 text-[var(--primary)]">
        <Upload aria-hidden="true" size={32} />
      </div>
      <h3 className="max-w-md text-lg font-bold">Upload a screen above to simulate how it appears across different accessibility needs</h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
        Choose a simulation type using the chips above, then upload a screenshot to generate a before/after comparison.
      </p>
    </div>
  );
}
