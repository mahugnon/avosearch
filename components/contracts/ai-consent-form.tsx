"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { recordAiConsentAction } from "@/lib/actions/review";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Props = {
  contractId: string;
  onConsented: () => void;
};

export function AiConsentForm({ contractId, onConsented }: Props) {
  const t = useTranslations("contracts.review.consent");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (!checked) return;
    startTransition(async () => {
      const result = await recordAiConsentAction(contractId);
      if (result.error) {
        setError(t("error"));
        return;
      }
      onConsented();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
      <Alert>
        <AlertDescription>{t("disclaimer")}</AlertDescription>
      </Alert>
      <div className="flex items-start gap-3">
        <Checkbox
          id="ai-consent"
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
        />
        <Label htmlFor="ai-consent" className="text-sm leading-relaxed font-normal">
          {t("checkbox")}
        </Label>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="button" disabled={!checked || pending} onClick={handleSubmit}>
        {pending ? t("submitting") : t("submit")}
      </Button>
    </div>
  );
}
