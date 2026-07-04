"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const options = [
  { value: "fr", label: "FR" },
  { value: "en", label: "EN" },
] as const;

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => router.replace(pathname, { locale: option.value })}
          className={cn(
            "min-w-9 rounded-md px-2 py-1 text-xs font-medium transition-colors",
            locale === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={locale === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
