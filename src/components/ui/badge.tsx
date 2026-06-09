import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "good" | "warn" | "risk";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-[var(--border)] bg-white text-[var(--foreground)]",
  good: "border-[#86efac] bg-[#dcfce7] text-[#166534]",
  warn: "border-[#fcd34d] bg-[var(--accent-soft)] text-[#92400e]",
  risk: "border-[#fca5a5] bg-[#fee2e2] text-[#991b1b]"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
