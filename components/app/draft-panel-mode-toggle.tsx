"use client";

import { Eye, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DraftPanelMode = "edit" | "preview";

type Props = {
  mode: DraftPanelMode;
  onChange: (mode: DraftPanelMode) => void;
  className?: string;
};

export function DraftPanelModeToggle({ mode, onChange, className }: Props) {
  const t = useTranslations("chat.mode");

  return (
    <div
      className={cn("flex rounded-lg border border-border/60 bg-muted/40 p-0.5", className)}
      role="tablist"
      aria-label={t("label")}
    >
      <Button
        type="button"
        role="tab"
        aria-selected={mode === "edit"}
        variant={mode === "edit" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 gap-1.5 rounded-md px-3"
        onClick={() => onChange("edit")}
      >
        <Pencil className="size-3.5" aria-hidden />
        {t("edit")}
      </Button>
      <Button
        type="button"
        role="tab"
        aria-selected={mode === "preview"}
        variant={mode === "preview" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 gap-1.5 rounded-md px-3"
        onClick={() => onChange("preview")}
      >
        <Eye className="size-3.5" aria-hidden />
        {t("preview")}
      </Button>
    </div>
  );
}
