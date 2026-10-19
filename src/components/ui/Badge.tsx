import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "sale" | "new";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-stone-100 text-ink-soft",
  sale: "bg-[color-mix(in_oklab,var(--color-sale)_12%,white)] text-[color:var(--color-sale)]",
  new: "bg-ink text-paper",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Small pill tag — "Sale", "New", "Limited Edition". Used sparingly. */
export function Badge({ className, tone = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "label-uppercase inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[var(--tracking-label)]",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
