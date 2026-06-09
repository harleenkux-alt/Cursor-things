import { Accessibility } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-white px-5 py-5 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="rounded-full bg-[var(--primary)] p-2.5 text-white">
          <Accessibility aria-hidden="true" size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Inclusive Design Simulator</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Experience interfaces through different accessibility needs</p>
        </div>
      </div>
    </header>
  );
}
