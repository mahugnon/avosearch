"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import type { RequiredPro, TriageResult } from "@prisma/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TriageResultView, type TriageViewData } from "@/components/contracts/triage-result";

type AnalyzeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: TriageViewData }
  | { status: "error"; code: string };

type Props = {
  contractId: string;
  initialData: TriageViewData | null;
  initialError?: string | null;
};

function toViewData(payload: Record<string, unknown>): TriageViewData {
  if (payload.outOfScope) {
    return {
      kind: "outOfScope",
      domain: String(payload.domain ?? ""),
      justification: String(payload.justification ?? ""),
      requiredPro: (payload.requiredPro as RequiredPro | null) ?? null,
    };
  }

  const analysis = payload.analysis as Record<string, unknown>;
  return {
    kind: "analysis",
    triage: analysis.triage as TriageResult,
    confidence: Number(analysis.confidence),
    domain: String(analysis.domain),
    justification: String(analysis.justification),
    flags: (analysis.flags as string[]) ?? [],
    requiredPro: (analysis.requiredPro as RequiredPro | null) ?? null,
    demoMode: Boolean(analysis.demoMode),
  };
}

function resolveInitialState(
  initialData: TriageViewData | null,
  initialError?: string | null
): AnalyzeState {
  if (initialData) return { status: "success", data: initialData };
  if (initialError) return { status: "error", code: initialError };
  return { status: "idle" };
}

export function AnalyzeContract({ contractId, initialData, initialError }: Props) {
  const t = useTranslations("contracts.triage");
  const [state, setState] = useState<AnalyzeState>(() =>
    resolveInitialState(initialData, initialError)
  );

  async function runAnalysis() {
    setState({ status: "loading" });
    try {
      const response = await fetch(`/api/contracts/${contractId}/analyze`, {
        method: "POST",
      });
      const payload = (await response.json()) as Record<string, unknown>;

      if (!response.ok) {
        setState({
          status: "error",
          code: String(payload.error ?? "ANALYZE_FAILED"),
        });
        return;
      }

      setState({ status: "success", data: toViewData(payload) });
    } catch {
      setState({ status: "error", code: "NETWORK_ERROR" });
    }
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t("analyzing")}</p>
      </div>
    );
  }

  if (state.status === "error") {
    const message =
      state.code === "AI_NOT_CONFIGURED"
        ? t("errors.aiNotConfigured")
        : state.code === "PARSE_FAILED" || state.code === "AI_FAILED"
          ? t("errors.aiFailed")
          : state.code === "NETWORK_ERROR"
            ? t("errors.network")
            : t("errors.generic");

    return (
      <Alert variant="destructive">
        <AlertTitle>{t("errors.title")}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{message}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void runAnalysis()}>
            {t("retry")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (state.status === "success") {
    return (
      <div className="space-y-4">
        <TriageResultView data={state.data} contractId={contractId} />
        <Button type="button" variant="outline" size="sm" onClick={() => void runAnalysis()}>
          {t("reanalyze")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">{t("notAnalyzedYet")}</p>
      <Button type="button" onClick={() => void runAnalysis()}>
        {t("startAnalysis")}
      </Button>
    </div>
  );
}
