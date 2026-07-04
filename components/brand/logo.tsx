import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = {
  lockup: "/logo/avosearch-lockup.svg",
  mark: "/logo/avosearch-mark.svg",
  markDark: "/logo/avosearch-mark-dark-bg.svg",
} as const;

type LogoVariant = keyof typeof LOGO_SRC;

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = "lockup", className, priority }: LogoProps) {
  const src = LOGO_SRC[variant];
  const isLockup = variant === "lockup";

  return (
    <Image
      src={src}
      alt="AvoSearch"
      width={isLockup ? 260 : 56}
      height={isLockup ? 56 : 56}
      priority={priority}
      className={cn(isLockup ? "h-8 w-auto" : "h-8 w-8", className)}
    />
  );
}
