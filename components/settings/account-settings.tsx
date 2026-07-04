"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { exportAccountDataAction, deleteAccountAction } from "@/lib/actions/account";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AccountSettings() {
  const t = useTranslations("settings");
  const [exportData, setExportData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleExport() {
    startTransition(async () => {
      const result = await exportAccountDataAction();
      if ("error" in result) {
        setError(t("errors.generic"));
        return;
      }
      setExportData(JSON.stringify(result, null, 2));
    });
  }

  function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    startTransition(async () => {
      await deleteAccountAction();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("export.title")}</CardTitle>
          <CardDescription>{t("export.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button type="button" variant="outline" disabled={pending} onClick={handleExport}>
            {t("export.button")}
          </Button>
          {exportData && (
            <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-xs">
              {exportData}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>{t("delete.title")}</CardTitle>
          <CardDescription>{t("delete.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="button" variant="destructive" disabled={pending} onClick={handleDelete}>
            {t("delete.button")}
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{t("rgpdNotice")}</p>
    </div>
  );
}
