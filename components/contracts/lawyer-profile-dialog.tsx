"use client";

import { useTranslations } from "next-intl";
import type { LawyerMatchView } from "@/lib/matching/lawyer-view";
import type { ContractReviewLawyer } from "@/lib/contracts/lawyer-review";
import { LawyerProfileCard } from "@/components/lawyer/lawyer-profile-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppLocale } from "@/lib/i18n";

type Props = {
  lawyer: ContractReviewLawyer;
  locale: AppLocale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toMatchView(lawyer: ContractReviewLawyer): LawyerMatchView {
  return {
    userId: lawyer.userId,
    name: lawyer.name,
    photoUrl: lawyer.photoUrl,
    barreau: lawyer.barreau,
    city: lawyer.city,
    specialties: lawyer.specialties,
    validationPriceCents: lawyer.validationPriceCents,
    responseTimeHours: lawyer.responseTimeHours,
    rating: lawyer.rating,
    ratingCount: lawyer.ratingCount,
    score: 0,
  };
}

export function LawyerProfileDialog({ lawyer, locale, open, onOpenChange }: Props) {
  const t = useTranslations("contracts.lawyerProfile");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <LawyerProfileCard lawyer={toMatchView(lawyer)} locale={locale} />
          {lawyer.bio.trim() && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{lawyer.bio}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
