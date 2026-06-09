"use client";

import { SignInMockup } from "@/components/sign-in-mockup";

export function ExampleDemo() {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--border)] bg-[#f3ece1]/60 p-5">
      <h3 className="mb-4 text-sm font-bold">See an example</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
          <span className="mb-3 inline-block rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-bold">
            Original
          </span>
          <div className="flex min-h-[280px] items-center justify-center rounded-lg bg-[#f9fafb] p-4">
            <SignInMockup />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white/80 p-4">
          <span className="mb-3 inline-block rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-xs font-bold text-white">
            Low Vision Simulation
          </span>
          <div className="flex min-h-[280px] items-center justify-center rounded-lg bg-[#f9fafb] p-4">
            <div style={{ filter: "blur(1.5px) contrast(0.7) brightness(0.85)" }}>
              <SignInMockup />
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
        Example: How a sign-in form appears to someone with low vision. Upload your own design above to test it.
      </p>
    </section>
  );
}
