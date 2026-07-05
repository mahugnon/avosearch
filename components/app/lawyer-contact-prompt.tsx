"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createLawyerInquiryContractAction } from "@/lib/actions/draft-chat";
import { LawyerSelectionDialog } from "@/components/contracts/lawyer-selection-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  inquiryMessage: string;
  onDecline: () => void;
};

export function LawyerContactPrompt({ inquiryMessage, onDecline }: Props) {
  const t = useTranslations("chat.lawyerOffer");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contractId, setContractId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleYes() {
    setCreating(true);
    setError(null);
    try {
      const result = await createLawyerInquiryContractAction(inquiryMessage);
      if (result.contractId) {
        setContractId(result.contractId);
        setDialogOpen(true);
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="flex justify-start">
        <div className="max-w-[88%] rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5 shadow-sm">
          <p className="text-sm font-medium">{t("title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={creating} onClick={() => void handleYes()}>
              {creating ? t("creating") : t("yes")}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={creating} onClick={onDecline}>
              {t("no")}
            </Button>
          </div>
        </div>
      </div>

      {contractId && (
        <LawyerSelectionDialog
          contractId={contractId}
          hideTrigger
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}
