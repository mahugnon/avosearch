"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/lib/actions/locale";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";

const options: Array<{ value: Locale; label: string }> = [
  { value: "fr", label: "FR" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchLocale(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border/60 bg-muted/40 p-0.5",
        pending && "opacity-60",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => switchLocale(option.value)}
          disabled={pending}
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
