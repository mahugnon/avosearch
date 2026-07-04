"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { ModStatus, RiskLevel } from "@prisma/client";
import { updateModificationStatusAction } from "@/lib/actions/review";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ModificationView = {
  id: string;
  order: number;
  originalExcerpt: string;
  proposedText: string;
  rationale: string;
  riskLevel: RiskLevel;
  status: ModStatus;
  amendedText?: string | null;
  lawyerComment?: string | null;
};

type Props = {
  contractId?: string;
  modifications: ModificationView[];
  readOnly?: boolean;
  onRefresh?: () => void;
};

const RISK_VARIANT: Record<RiskLevel, "secondary" | "outline" | "destructive"> = {
  FAIBLE: "secondary",
  MOYEN: "outline",
  ELEVE: "destructive",
};

export function ReviewPanel({ modifications, readOnly, onRefresh }: Props) {
  const t = useTranslations("contracts.review");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleStatus = useCallback(
    async (id: string, status: "ACCEPTEE_CLIENT" | "REJETEE_CLIENT") => {
      setPendingId(id);
      await updateModificationStatusAction(id, status);
      onRefresh?.();
      setPendingId(null);
    },
    [onRefresh]
  );

  if (modifications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noModifications")}</p>
    );
  }

  return (
    <div className="space-y-4">
      {modifications.map((mod) => (
        <Card key={mod.id}>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                {t("modification", { order: mod.order })}
              </CardTitle>
              <Badge variant={RISK_VARIANT[mod.riskLevel]}>{mod.riskLevel}</Badge>
              {mod.status !== "PROPOSEE" && (
                <Badge variant="outline">{t(`status.${mod.status}`)}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg bg-red-500/5 p-3 ring-1 ring-red-500/20">
                <p className="mb-1 text-xs font-medium uppercase text-red-700 dark:text-red-400">
                  {t("original")}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{mod.originalExcerpt}</p>
              </div>
              <div className="rounded-lg bg-emerald-500/5 p-3 ring-1 ring-emerald-500/20">
                <p className="mb-1 text-xs font-medium uppercase text-emerald-700 dark:text-emerald-400">
                  {t("proposed")}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {mod.amendedText ?? mod.proposedText}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">{mod.rationale}</p>
            {mod.lawyerComment && (
              <p className="rounded-md bg-muted p-3 text-muted-foreground">
                <span className="font-medium text-foreground">{t("lawyerNote")}: </span>
                {mod.lawyerComment}
              </p>
            )}
            {!readOnly && mod.status === "PROPOSEE" && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={pendingId === mod.id}
                  onClick={() => void handleStatus(mod.id, "ACCEPTEE_CLIENT")}
                >
                  {t("accept")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pendingId === mod.id}
                  onClick={() => void handleStatus(mod.id, "REJETEE_CLIENT")}
                >
                  {t("reject")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
