import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Small uppercase, letter-spaced label used above headings — "NEW ARRIVALS",
 * "GIFTING", "THE RAKHI EDIT" — to introduce a section without competing
 * with the serif display type below it.
 */
export function Eyebrow({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "label-uppercase block text-caption font-medium tracking-[var(--tracking-label-wide)] text-ink-muted",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
