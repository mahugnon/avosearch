"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deliverMissionAction, lawyerValidateModificationAction } from "@/lib/actions/missions";
import type { ModificationView } from "@/components/contracts/review-panel";
import { ReviewPanel } from "@/components/contracts/review-panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Props = {
  missionId: string;
  contractId: string;
  modifications: ModificationView[];
};

export function LawyerMissionReview({ missionId, contractId, modifications }: Props) {
  const t = useTranslations("lawyer.mission");
  const router = useRouter();
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);
  const [mods, setMods] = useState(modifications);

  async function generateReview() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/contracts/${contractId}/review`, { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { modifications?: ModificationView[] };
        setMods(data.modifications ?? []);
        router.refresh();
      }
    } finally {
      setGenerating(false);
    }
  }

  function validateMod(id: string, action: "VALIDEE_AVOCAT" | "REJETEE_AVOCAT") {
    startTransition(async () => {
      await lawyerValidateModificationAction({ modificationId: id, action });
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
      {mods.length === 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={() => void generateReview()} disabled={generating || pending}>
            {generating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("generatingReview")}
              </>
            ) : (
              t("generateReview")
            )}
          </Button>
          <p className="text-xs text-muted-foreground">{t("reviewLawyerOnly")}</p>
        </div>
      )}

      <ReviewPanel modifications={mods} readOnly />
      <div className="space-y-3">
        {mods
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
