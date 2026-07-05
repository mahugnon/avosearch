import { cn } from "@/lib/utils";

type LogoVariant = "lockup" | "mark" | "markDark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Kept for API compatibility with previous next/image-based logo. */
  priority?: boolean;
}

/**
 * Editorial AvoSearch logo: two overlapping discs (ink + royal blue) beside a
 * serif wordmark. Rendered inline so it always tracks the design tokens.
 */
export function Logo({ variant = "lockup", className }: LogoProps) {
  const onDark = variant === "markDark";
  const ringColor = onDark ? "var(--brand-ink)" : "#f7f5ef";

  const mark = (
    <span className="relative inline-flex shrink-0 items-center" aria-hidden>
      <span className="size-5 rounded-full" style={{ background: "var(--brand-ink)" }} />
      <span
        className="-ml-2 size-5 rounded-full"
        style={{ background: "var(--brand-blue)", boxShadow: `0 0 0 2px ${ringColor}` }}
      />
    </span>
  );

  if (variant !== "lockup") {
    return <span className={cn("inline-flex", className)}>{mark}</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      {mark}
      <span
        className="font-display text-2xl leading-none"
        style={{ color: onDark ? "#f7f5ef" : "var(--foreground)" }}
      >
        AvoSearch
      </span>
    </span>
  );
}
