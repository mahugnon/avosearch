import { AlertTriangle, Scale, ShieldCheck, UserRoundSearch } from "lucide-react";
import type { Analysis, TriageResult } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
import { isOutOfScope } from "@/lib/ai/guardrails";

type Props = {
  analysis: Analysis;
  contractTitle: string;
};

const TRIAGE_ICONS: Record<TriageResult, typeof ShieldCheck> = {
  IA_SUFFIT: ShieldCheck,
  AVOCAT_RECOMMANDE: UserRoundSearch,
  ACTE_REGLEMENTE: Scale,
};

export async function TriageResultView({ analysis, contractTitle }: Props) {
  const t = await getTranslations("contracts.triage");
  const outOfScope = isOutOfScope(analysis);

  if (outOfScope) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" aria-hidden />
          <AlertTitle>{t("outOfScope.title")}</AlertTitle>
          <AlertDescription>{analysis.justification}</AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>{t("outOfScope.nextTitle")}</CardTitle>
            <CardDescription>{t("outOfScope.nextDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/app">{t("backToDashboard")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const triageKey = analysis.triage as TriageResult;
  const Icon = TRIAGE_ICONS[triageKey];

  const requiredProLabel =
    analysis.requiredPro === "NOTAIRE"
      ? t("requiredPro.notaire")
      : analysis.requiredPro === "AVOCAT"
        ? t("requiredPro.avocat")
        : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{contractTitle}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {t(`cases.${triageKey}.title`)}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{analysis.domain}</Badge>
                <Badge variant="outline">
                  {t("confidence", { percent: Math.round(analysis.confidence * 100) })}
                </Badge>
              </div>
              <CardDescription className="text-base text-foreground">
                {analysis.justification}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {analysis.flags.length > 0 && (
          <CardContent>
            <p className="mb-3 text-sm font-medium">{t("flagsTitle")}</p>
            <ul className="space-y-2">
              {analysis.flags.map((flag) => (
                <li
                  key={flag}
                  className="flex items-start gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      {requiredProLabel && (
        <Alert>
          <Scale className="h-4 w-4" aria-hidden />
          <AlertTitle>{t("regulatedActTitle")}</AlertTitle>
          <AlertDescription>
            {t("regulatedActDescription", { professional: requiredProLabel })}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t(`cases.${triageKey}.nextTitle`)}</CardTitle>
          <CardDescription>{t(`cases.${triageKey}.nextDescription`)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {triageKey === "IA_SUFFIT" && (
            <Button disabled>{t("cases.IA_SUFFIT.cta")}</Button>
          )}
          {(triageKey === "AVOCAT_RECOMMANDE" || triageKey === "ACTE_REGLEMENTE") && (
            <Button disabled>{t("cases.AVOCAT_RECOMMANDE.cta")}</Button>
          )}
          <Button asChild variant="outline">
            <Link href="/app">{t("backToDashboard")}</Link>
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
