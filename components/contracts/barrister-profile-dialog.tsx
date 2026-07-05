"use client";

import { useTranslations } from "next-intl";
import type { BarristerMatchView } from "@/lib/matching/barrister-view";
import type { ContractReviewBarrister } from "@/lib/contracts/barrister-review";
import { BarristerProfileCard } from "@/components/barrister/barrister-profile-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppLocale } from "@/lib/i18n";

type Props = {
  barrister: ContractReviewBarrister;
  locale: AppLocale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toMatchView(barrister: ContractReviewBarrister): BarristerMatchView {
  return {
    userId: barrister.userId,
    name: barrister.name,
    photoUrl: barrister.photoUrl,
    barreau: barrister.barreau,
    city: barrister.city,
    specialties: barrister.specialties,
    validationPriceCents: barrister.validationPriceCents,
    responseTimeHours: barrister.responseTimeHours,
    rating: barrister.rating,
    ratingCount: barrister.ratingCount,
    score: 0,
  };
}

export function BarristerProfileDialog({ barrister, locale, open, onOpenChange }: Props) {
  const t = useTranslations("contracts.barristerProfile");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <BarristerProfileCard barrister={toMatchView(barrister)} locale={locale} />
          {barrister.bio.trim() && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{barrister.bio}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
