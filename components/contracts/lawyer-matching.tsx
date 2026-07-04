"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MissionType } from "@prisma/client";
import { createMissionAction } from "@/lib/actions/missions";
import { payMissionAction } from "@/lib/actions/payments";
import type { LawyerMatchView } from "@/lib/matching/lawyer-view";
import { LawyerProfileCard } from "@/components/lawyer/lawyer-profile-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { AppLocale } from "@/lib/i18n";

type Props = {
  contractId: string;
  lawyers: LawyerMatchView[];
  plan?: "ai-lawyer" | "mission";
  missionType?: MissionType;
};

export function LawyerMatchingList({
  contractId,
  lawyers,
  plan = "mission",
  missionType = MissionType.RELECTURE,
}: Props) {
  const t = useTranslations("contracts.matching");
  const locale = useLocale() as AppLocale;
  const [selectedId, setSelectedId] = useState(lawyers[0]?.userId ?? null);
  const [pending, startTransition] = useTransition();

  function priceForLawyer(lawyer: LawyerMatchView) {
    return plan === "ai-lawyer" ? lawyer.validationPriceCents : lawyer.validationPriceCents * 3;
  }

  function handleConfirm() {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await createMissionAction({
        contractId,
        lawyerUserId: selectedId,
        type: plan === "ai-lawyer" ? MissionType.VALIDATION : missionType,
        plan,
      });
      if (!result.ok || !result.missionId) return;
      await payMissionAction(result.missionId);
    });
  }

  if (lawyers.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  const selectedLawyer = lawyers.find((l) => l.userId === selectedId);

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {lawyers.map((lawyer) => (
          <li key={lawyer.userId}>
            <LawyerProfileCard
              lawyer={lawyer}
              locale={locale}
              selected={lawyer.userId === selectedId}
              priceCents={priceForLawyer(lawyer)}
              onSelect={() => setSelectedId(lawyer.userId)}
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
        {selectedLawyer && (
          <p className="text-sm text-muted-foreground">
            {t("selectedSummary", { name: selectedLawyer.name })}
          </p>
        )}
        <Button type="button" disabled={pending || !selectedId} onClick={handleConfirm}>
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("creating")}
            </>
          ) : (
            t("confirmAndPay")
          )}
        </Button>
      </div>
    </div>
  );
}
