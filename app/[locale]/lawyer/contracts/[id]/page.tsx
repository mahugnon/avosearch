import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContractViewer } from "@/components/contracts/contract-viewer";
import { Button } from "@/components/ui/button";
import { requireLawyerContractReview } from "@/lib/contracts/lawyer-access";
import { loadTemplateBody } from "@/lib/templates/load";
import { getContractHighlightData } from "@/lib/templates/highlight";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { contract } = await requireLawyerContractReview(id);
  return { title: contract.title };
}

export default async function LawyerContractReviewPage({ params }: Props) {
  const { id } = await params;
  const { contract } = await requireLawyerContractReview(id);
  const t = await getTranslations("lawyer.review");

  const highlight = await (async () => {
    if (!contract.template) return null;
    let templateBody = contract.template.body?.trim() ?? "";
    if (!templateBody) {
      try {
        templateBody = await loadTemplateBody({
          body: contract.template.body,
          fileKey: contract.template.fileKey ?? null,
          fileName: contract.template.fileName ?? null,
          mimeType: contract.template.mimeType ?? null,
        });
      } catch {
        return null;
      }
    }
    return getContractHighlightData({
      templateBody,
      draftAnswers: contract.draftAnswers,
    });
  })();

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/lawyer">{t("backToDashboard")}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{contract.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("clientLabel", { name: contract.owner.name })}
        </p>
        {contract.userQuestion && (
          <p className="mt-1 text-sm text-muted-foreground">{contract.userQuestion}</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{t("intro")}</p>

      {contract.extractedText.trim() && (
        <ContractViewer
          title={t("documentPreview")}
          body={contract.extractedText}
          highlight={highlight}
          mode="lawyer"
        />
      )}
    </div>
  );
}
