"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ContractReviewBarrister } from "@/lib/contracts/barrister-review";
import { BarristerProfileDialog } from "@/components/contracts/barrister-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AppLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  barrister: ContractReviewBarrister;
  locale: AppLocale;
  className?: string;
  size?: "sm" | "md";
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function BarristerReviewedBy({ barrister, locale, className, size = "sm" }: Props) {
  const t = useTranslations("contracts");
  const [open, setOpen] = useState(false);

  const avatarSize = size === "sm" ? "size-6" : "size-8";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <>
      <div
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-500/10 px-2 py-1 font-medium text-emerald-800 dark:text-emerald-300",
          className
        )}
      >
        <button
          type="button"
          className="shrink-0 rounded-full ring-offset-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => setOpen(true)}
          aria-label={t("viewBarristerProfile", { name: barrister.name })}
        >
          <Avatar className={avatarSize}>
            {barrister.photoUrl && <AvatarImage src={barrister.photoUrl} alt={barrister.name} />}
            <AvatarFallback className="bg-emerald-100 text-[0.625rem] text-emerald-800">
              {initials(barrister.name)}
            </AvatarFallback>
          </Avatar>
        </button>
        <span className={cn("truncate", textClass)}>
          {t("reviewedBy", { name: barrister.name })}
        </span>
      </div>

      <BarristerProfileDialog barrister={barrister} locale={locale} open={open} onOpenChange={setOpen} />
    </>
  );
}
