"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
};

export function ChatFieldCard({ label, onSubmit, disabled }: Props) {
  const t = useTranslations("chat.field");
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  const canSubmit = !disabled && value.trim().length > 0;

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "relative w-full max-w-[17.5rem] overflow-hidden rounded-2xl",
          "border border-primary/12 bg-gradient-to-br from-card via-card to-primary/[0.05]",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.06)]",
          "ring-1 ring-inset ring-white/40 dark:ring-white/5"
        )}
      >
        <div
          className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-primary/70 via-primary/45 to-primary/15"
          aria-hidden
        />

        <div className="px-3.5 py-3 pl-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-primary/75">
            {label}
          </p>

          <div className="mt-2 space-y-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t("placeholder")}
              disabled={disabled}
              className="h-8 border-border/50 bg-background/70 text-sm shadow-none focus-visible:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/15"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="h-8 w-full gap-1.5 rounded-lg text-xs font-medium"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {t("submit")}
              <ArrowRight className="size-3.5 opacity-80" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
