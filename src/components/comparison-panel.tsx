"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInMockup } from "@/components/sign-in-mockup";
import { simulationById } from "@/lib/simulations/catalog";
import { useSimulatorStore } from "@/store/use-simulator-store";

export function ComparisonPanel() {
  const { imageUrl, selectedSimulation, result, isSimulating, error } = useSimulatorStore();
  const simulation = simulationById[selectedSimulation];
  const showDemo = !imageUrl;

  const download = () => {
    if (!result) {
      return;
    }

    const link = document.createElement("a");
    link.href = result.dataUrl;
    link.download = `inclusive-design-${selectedSimulation}.png`;
    link.click();
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-bold">Compare</h2>
        {imageUrl && result ? (
          <Button type="button" size="sm" onClick={download}>
            <Download aria-hidden="true" size={15} strokeWidth={1.5} />
            Download comparison
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Original</div>
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 sm:min-h-[420px] lg:min-h-[480px]">
            {showDemo ? (
              <SignInMockup />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={imageUrl} alt="Original upload" className="max-h-[65vh] w-full object-contain" />
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            {showDemo ? "Low Vision Simulation" : simulation.name}
          </div>
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 sm:min-h-[420px] lg:min-h-[480px]">
            {showDemo ? (
              <div style={{ filter: "blur(1.5px) contrast(0.7) brightness(0.85)" }}>
                <SignInMockup />
              </div>
            ) : result ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={result.dataUrl}
                alt={`${simulation.name} simulation`}
                className="max-h-[65vh] w-full object-contain"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl!}
                alt="Generating simulation"
                className="max-h-[65vh] w-full object-contain opacity-30"
              />
            )}

            {isSimulating ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white">
                  <Loader2 aria-hidden="true" className="animate-spin" size={16} />
                  Processing...
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showDemo ? (
        <p className="mt-5 text-center text-sm text-[var(--muted-foreground)]">
          Example: how a sign-in form appears to someone with low vision. Upload your own design above to test it.
        </p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : null}
    </section>
  );
}
