"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RequestLawyerButton } from "@/components/contracts/request-lawyer-button";
import { AlertTriangle, Scale, ShieldCheck, UserRound } from "lucide-react";
import type { RequiredPro, TriageResult } from "@prisma/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatEuros, pricing } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";

export type TriageViewData =
  | {
      kind: "outOfScope";
      domain: string;
      justification: string;
      requiredPro: RequiredPro | null;
    }
  | {
      kind: "analysis";
      triage: TriageResult;
      confidence: number;
      domain: string;
      justification: string;
      flags: string[];
      requiredPro: RequiredPro | null;
      demoMode?: boolean;
    };

const TRIAGE_ICONS = {
  IA_SUFFIT: ShieldCheck,
  AVOCAT_RECOMMANDE: Scale,
  ACTE_REGLEMENTE: UserRound,
} as const;

type Props = {
  data: TriageViewData;
  contractId: string;
};

export function TriageResultView({ data, contractId }: Props) {
  const t = useTranslations("contracts.triage");
  const locale = useLocale() as AppLocale;

  if (data.kind === "outOfScope") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" aria-hidden />
            <CardTitle>{t("outOfScope.title")}</CardTitle>
          </div>
          <CardDescription>{t("outOfScope.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{data.justification}</p>
          {data.requiredPro && (
            <p className="text-sm text-muted-foreground">
              {t("requiredPro", { pro: t(`pro.${data.requiredPro}`) })}
            </p>
          )}
          <Alert>
            <AlertTitle>{t("outOfScope.alertTitle")}</AlertTitle>
            <AlertDescription>{t("outOfScope.alertDescription")}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const Icon = TRIAGE_ICONS[data.triage];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
            <CardTitle>{t(`cases.${data.triage}.title`)}</CardTitle>
            <Badge variant="secondary">{data.domain}</Badge>
          </div>
          <CardDescription>{t(`cases.${data.triage}.subtitle`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{data.justification}</p>
          <p className="text-xs text-muted-foreground">
            {t("confidence", { value: Math.round(data.confidence * 100) })}
          </p>
          {data.flags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("flagsTitle")}</p>
              <ul className="space-y-1">
                {data.flags.map((flag) => (
                  <li key={flag} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.requiredPro && (
            <p className="text-sm text-muted-foreground">
              {t("requiredPro", { pro: t(`pro.${data.requiredPro}`) })}
            </p>
          )}
        </CardContent>
      </Card>

      {data.triage === "IA_SUFFIT" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("nextSteps.iaSuffit.title")}</CardTitle>
            <CardDescription>{t("nextSteps.lawyerReviewOnly")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("nextSteps.iaSuffit.aiLawyerHint")}
            </p>
            <RequestLawyerButton contractId={contractId} />
          </CardContent>
        </Card>
      )}

      {data.triage === "AVOCAT_RECOMMANDE" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("nextSteps.avocat.title")}</CardTitle>
            <CardDescription>{t("nextSteps.avocat.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("nextSteps.avocat.priceRange", {
                min: formatEuros(pricing.missionMinCents, locale),
                max: formatEuros(pricing.missionMaxCents, locale),
              })}
            </p>
            <Button asChild>
              <Link href={`/app/contracts/${contractId}/matching`}>
                {t("nextSteps.findLawyer")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {data.triage === "ACTE_REGLEMENTE" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("nextSteps.acte.title")}</CardTitle>
            <CardDescription>{t("nextSteps.acte.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertTitle>{t("nextSteps.acte.alertTitle")}</AlertTitle>
              <AlertDescription>{t("nextSteps.acte.alertDescription")}</AlertDescription>
            </Alert>
            <Button asChild variant="outline">
              <Link href={`/app/contracts/${contractId}/matching`}>
                {t("nextSteps.findLawyer")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
      {data.kind === "analysis" && data.demoMode && (
        <p className="text-xs text-amber-700 dark:text-amber-400">{t("demoMode")}</p>
      )}
    </div>
  );
}
