import { Accessibility } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-white/50 px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <div className="rounded-xl bg-[var(--primary)] p-2 text-[var(--primary-foreground)]">
          <Accessibility aria-hidden="true" size={20} />
        </div>
        <h1 className="text-lg font-bold tracking-tight">Inclusive Design Simulator</h1>
      </div>
    </header>
  );
}
