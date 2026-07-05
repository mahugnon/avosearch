"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deliverMissionAction, barristerValidateModificationAction } from "@/lib/actions/missions";
import type { ModificationView } from "@/components/contracts/review-panel";
import { ReviewPanel } from "@/components/contracts/review-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  missionId: string;
  modifications: ModificationView[];
};

export function BarristerMissionReview({ missionId, modifications }: Props) {
  const t = useTranslations("barrister.mission");
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function validateMod(id: string, action: "VALIDEE_AVOCAT" | "REJETEE_AVOCAT") {
    startTransition(async () => {
      await barristerValidateModificationAction({ modificationId: id, action });
      router.refresh();
    });
  }

  function deliver() {
    startTransition(async () => {
      await deliverMissionAction(missionId, note);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <ReviewPanel modifications={modifications} readOnly />
      <div className="space-y-3">
        {modifications
          .filter((m) => m.status === "ACCEPTEE_CLIENT" || m.status === "PROPOSEE")
          .map((mod) => (
            <div key={mod.id} className="flex flex-wrap gap-2 rounded-lg border p-3">
              <span className="text-sm font-medium">{t("mod", { order: mod.order })}</span>
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => validateMod(mod.id, "VALIDEE_AVOCAT")}
              >
                {t("validate")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => validateMod(mod.id, "REJETEE_AVOCAT")}
              >
                {t("reject")}
              </Button>
            </div>
          ))}
      </div>
      <div className="space-y-2">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("globalNotePlaceholder")}
          rows={3}
        />
        <Button type="button" disabled={pending || !note.trim()} onClick={deliver}>
          {t("deliver")}
        </Button>
      </div>
    </div>
  );
}
