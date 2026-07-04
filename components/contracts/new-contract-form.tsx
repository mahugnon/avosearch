"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createContractAction } from "@/lib/actions/contracts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewContractForm() {
  const t = useTranslations("contracts.form");
  const [state, formAction, pending] = useActionState(createContractAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input id="title" name="title" placeholder={t("titlePlaceholder")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userQuestion">{t("questionLabel")}</Label>
            <Textarea
              id="userQuestion"
              name="userQuestion"
              rows={3}
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
          <div className="space-y-2">
            <Label htmlFor="pastedText">{t("pastedTextLabel")}</Label>
            <Textarea
              id="pastedText"
              name="pastedText"
              rows={6}
              placeholder={t("pastedTextPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{t("pastedTextHint")}</p>
          </div>
        </CardContent>
        <CardFooter className="mt-2 flex flex-col items-stretch gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? t("submitting") : t("submit")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
        </CardFooter>
      </form>
    </Card>
  );
}
