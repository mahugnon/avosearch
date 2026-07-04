"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createContractAction } from "@/lib/actions/contracts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewContractForm() {
  const t = useTranslations("contracts");
  const [state, formAction, pending] = useActionState(createContractAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="userQuestion">{t("questionLabel")}</Label>
        <Textarea
          id="userQuestion"
          name="userQuestion"
          rows={4}
          placeholder={t("questionPlaceholder")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">{t("fileLabel")}</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        />
        <p className="text-xs text-muted-foreground">{t("fileHint")}</p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">{t("formHint")}</p>
        <Button type="submit" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
