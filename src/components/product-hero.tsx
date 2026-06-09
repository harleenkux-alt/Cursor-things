import { Accessibility, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProductHero() {
  return (
    <header className="mx-auto max-w-7xl px-5 pb-8 pt-8 sm:px-8 lg:px-10">
      <nav className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[var(--primary)] p-2.5 text-[var(--primary-foreground)]">
            <Accessibility aria-hidden="true" size={22} />
          </div>
          <div>
            <div className="font-black tracking-tight">Inclusive Design Simulator</div>
            <div className="text-xs font-medium text-[var(--muted-foreground)]">AI accessibility portfolio MVP</div>
          </div>
        </div>
        <Badge tone="good">Phase 1 MVP</Badge>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/65 px-3 py-2 text-sm font-semibold">
            <Sparkles aria-hidden="true" size={16} className="text-[var(--accent)]" />
            Experience exclusion before your users do
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Simulate how product screens feel across visual, cognitive, and motor conditions.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
            Upload an interface screenshot, generate an experiential accessibility simulation, review a scorecard, and
            turn the result into design recommendations your team can act on.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--border)] bg-white/58 p-5 shadow-[0_20px_70px_rgba(31,58,53,0.12)]">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold">
            <ArrowRight aria-hidden="true" size={16} />
            What this demonstrates
          </div>
          <div className="grid gap-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <div className="rounded-2xl bg-white/70 p-4">
              <strong className="text-[var(--foreground)]">Human-AI collaboration:</strong> simulations pair lived-risk
              empathy with actionable recommendations.
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <strong className="text-[var(--foreground)]">Product thinking:</strong> the workflow supports designers,
              developers, auditors, and students.
            </div>
            <div className="rounded-2xl bg-white/70 p-4">
              <strong className="text-[var(--foreground)]">Ethics:</strong> the interface frames simulations as
              approximations, not replacements for disabled-user research.
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
