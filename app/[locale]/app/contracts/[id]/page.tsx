import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { AnalyzeContract } from "@/components/contracts/analyze-contract";
import type { TriageViewData } from "@/components/contracts/triage-result";
import { runContractTriage, TriageError } from "@/lib/ai/triage";
import { Button } from "@/components/ui/button";
import { requireClientContract } from "@/lib/contracts/access";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ analyze?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { contract } = await requireClientContract(id);
  return { title: contract.title };
}

export default async function ContractDetailPage({ params, searchParams }: Props) {
  const { id, locale } = await params;
  const { analyze } = await searchParams;
  const { contract } = await requireClientContract(id);
  const t = await getTranslations("contracts");

  let analyzeError: string | null = null;
  let outOfScope: TriageViewData | null = null;

  if (analyze === "1" && !contract.analysis) {
    let shouldRedirect = false;

    try {
      const { result, model } = await runContractTriage({
        extractedText: contract.extractedText,
        userQuestion: contract.userQuestion,
      });

      if (result.outOfScope) {
        outOfScope = {
          kind: "outOfScope",
          domain: result.domain,
          justification: result.justification,
          requiredPro: result.requiredPro,
        };
      } else {
        await prisma.analysis.create({
          data: {
            contractId: contract.id,
            triage: result.triage,
            confidence: result.confidence,
            domain: result.domain,
            justification: result.justification,
            flags: result.flags,
            requiredPro: result.requiredPro,
            model,
          },
        });
        shouldRedirect = true;
      }
    } catch (error) {
      analyzeError =
        error instanceof TriageError ? error.code : "ANALYZE_FAILED";
    }

    if (shouldRedirect) {
      redirect({ href: `/app/contracts/${id}`, locale });
    }
  }

  const initialData: TriageViewData | null =
    outOfScope ??
    (contract.analysis
      ? {
          kind: "analysis",
          triage: contract.analysis.triage,
          confidence: contract.analysis.confidence,
          domain: contract.analysis.domain,
          justification: contract.analysis.justification,
          flags: contract.analysis.flags,
          requiredPro: contract.analysis.requiredPro,
          demoMode: contract.analysis.model === "demo-heuristic",
        }
      : null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/app">{t("backToDashboard")}</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{contract.title}</h1>
          {contract.userQuestion && (
            <p className="mt-2 text-sm text-muted-foreground">{contract.userQuestion}</p>
          )}
        </div>
      </div>

      <AnalyzeContract
        contractId={contract.id}
        initialData={initialData}
        initialError={analyzeError}
      />
    </div>
  );
}
