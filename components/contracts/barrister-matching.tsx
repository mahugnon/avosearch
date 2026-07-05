"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MissionType } from "@prisma/client";
import { createMissionAction } from "@/lib/actions/missions";
import { payMissionAction } from "@/lib/actions/payments";
import type { BarristerMatchView } from "@/lib/matching/barrister-view";
import { BarristerProfileCard } from "@/components/barrister/barrister-profile-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { AppLocale } from "@/lib/i18n";

type Props = {
  contractId: string;
  barristers: BarristerMatchView[];
  plan?: "ai-barrister" | "mission";
  missionType?: MissionType;
};

export function BarristerMatchingList({
  contractId,
  barristers,
  plan = "mission",
  missionType = MissionType.RELECTURE,
}: Props) {
  const t = useTranslations("contracts.matching");
  const locale = useLocale() as AppLocale;
  const [selectedId, setSelectedId] = useState(barristers[0]?.userId ?? null);
  const [pending, startTransition] = useTransition();

  function priceForBarrister(barrister: BarristerMatchView) {
    return plan === "ai-barrister" ? barrister.validationPriceCents : barrister.validationPriceCents * 3;
  }

  function handleConfirm() {
    if (!selectedId) return;
    startTransition(async () => {
      const result = await createMissionAction({
        contractId,
        barristerUserId: selectedId,
        type: plan === "ai-barrister" ? MissionType.VALIDATION : missionType,
        plan,
      });
      if (!result.ok || !result.missionId) return;
      await payMissionAction(result.missionId);
    });
  }

  if (barristers.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  const selectedBarrister = barristers.find((l) => l.userId === selectedId);

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {barristers.map((barrister) => (
          <li key={barrister.userId}>
            <BarristerProfileCard
              barrister={barrister}
              locale={locale}
              selected={barrister.userId === selectedId}
              priceCents={priceForBarrister(barrister)}
              onSelect={() => setSelectedId(barrister.userId)}
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
        {selectedBarrister && (
          <p className="text-sm text-muted-foreground">
            {t("selectedSummary", { name: selectedBarrister.name })}
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
