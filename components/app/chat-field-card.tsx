"use client";

import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FieldOption = { value: string; label: string };

type Props = {
  label: string;
  fieldKey: string;
  hint?: string;
  type?: "text" | "radio";
  options?: FieldOption[];
  demoValue?: string;
  onSubmit: (value: string, fieldKey: string) => void;
  disabled?: boolean;
};

export function ChatFieldCard({
  label,
  fieldKey,
  hint,
  type = "text",
  options,
  demoValue,
  onSubmit,
  disabled,
}: Props) {
  const t = useTranslations("chat.field");
  const [value, setValue] = useState("");
  const isRadio = type === "radio" && options && options.length > 0;

  function submit(next: string) {
    const trimmed = next.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, fieldKey);
    setValue("");
  }

  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl",
          isRadio ? "max-w-[22rem]" : "max-w-[19rem]",
          "border border-primary/12 bg-gradient-to-br from-card via-card to-primary/[0.05]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.06)]",
          "ring-1 ring-inset ring-white/40 dark:ring-white/5"
        )}
      >
        <div
          className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-primary/70 via-primary/45 to-primary/15"
          aria-hidden
        />

        <div className="px-4 py-3.5 pl-4.5">
          <p className="text-[0.8125rem] font-semibold leading-snug text-foreground">{label}</p>
          {hint && (
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">
              {isRadio ? t("optionsHint") : hint}
            </p>
          )}
          {isRadio && !hint && (
            <p className="mt-1 text-[0.6875rem] text-muted-foreground">{t("optionsHint")}</p>
          )}

          {isRadio ? (
            <div className="mt-3 flex flex-col gap-1.5" role="group" aria-label={label}>
              {options!.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => submit(option.value)}
                  className={cn(
                    "group/opt flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                    "border-border/70 bg-background/70 hover:border-primary/40 hover:bg-primary/[0.06]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                    "disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="flex size-5 items-center justify-center rounded-full border border-border text-transparent transition-colors group-hover/opt:border-primary group-hover/opt:bg-primary group-hover/opt:text-primary-foreground">
                    <Check className="size-3" aria-hidden />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2.5 space-y-2">
              {demoValue && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => submit(demoValue)}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-dashed border-primary/40 px-2.5 py-1 text-[0.6875rem] font-medium text-primary transition-colors hover:bg-primary/[0.06] disabled:opacity-50"
                >
                  <Sparkles className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{t("useExample", { value: demoValue })}</span>
                </button>
              )}
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t("placeholder")}
                disabled={disabled}
                className="h-8 border-border/50 bg-background/70 text-sm shadow-none focus-visible:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/15"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit(value);
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                className="h-8 w-full gap-1.5 text-xs font-medium"
                disabled={!canSubmit}
                onClick={() => submit(value)}
              >
                {t("submit")}
                <ArrowRight className="size-3.5 opacity-80" aria-hidden />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
