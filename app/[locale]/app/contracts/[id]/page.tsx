import { ContractDraftStatus, MissionStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Pencil } from "lucide-react";
import { ContractBarristerSubmitSection } from "@/components/contracts/contract-barrister-submit-section";
import { ContractViewer } from "@/components/contracts/contract-viewer";
import { BarristerReviewedBy } from "@/components/contracts/barrister-reviewed-by";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireClientContract } from "@/lib/contracts/access";
import {
  getClientDeliveredMissionForContract,
  getReviewBarristerForContract,
} from "@/lib/contracts/barrister-review";
import { hasViewableDocument, isListableClientContract } from "@/lib/contracts/document";
import { prisma } from "@/lib/db";
import { loadTemplateBody } from "@/lib/templates/load";
import { highlightFromRenderedContract, getContractHighlightData } from "@/lib/templates/highlight";
import { renderDraftPreview, getDraftPreviewHighlight } from "@/lib/templates/draft-preview";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { contract } = await requireClientContract(id);
  return { title: contract.title };
}

export default async function ContractDetailPage({ params }: Props) {
  const { id, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const { contract } = await requireClientContract(id);
  const t = await getTranslations("contracts");
  const tClient = await getTranslations("client");

  if (
    contract.draftStatus === ContractDraftStatus.IN_PROGRESS &&
    contract.template
  ) {
    const previewBody = await renderDraftPreview({
      template: contract.template,
      draftAnswers: contract.draftAnswers,
    });
    const highlight = await getDraftPreviewHighlight({
      template: contract.template,
      draftAnswers: contract.draftAnswers,
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
              <Link href="/app/contracts">{t("backToContracts")}</Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">{contract.title}</h1>
            <div className="mt-2">
              <Badge variant="outline">{t("draftInProgress")}</Badge>
            </div>
          </div>
          <Button asChild className="gap-1.5 shrink-0">
            <Link href={`/app/contracts/${id}/draft`}>
              <Pencil className="size-4" aria-hidden />
              {tClient("contracts.editDraft")}
            </Link>
          </Button>
        </div>

        <ContractViewer
          title={contract.title}
          body={previewBody}
          contractId={contract.id}
          highlight={highlight}
          draftPreview
        />
      </div>
    );
  }

  const deliveredMission = await getClientDeliveredMissionForContract(id, contract.ownerId);
  const reviewBarrister = await getReviewBarristerForContract(id, contract.ownerId);

  const activeMission = deliveredMission
    ? null
    : await prisma.mission.findFirst({
        where: {
          contractId: id,
          clientId: contract.ownerId,
          status: { notIn: [MissionStatus.ANNULEE, MissionStatus.TERMINEE] },
        },
        select: { id: true, status: true },
      });

  if (!isListableClientContract(contract, { hasDeliveredMission: !!deliveredMission })) {
    if (activeMission) {
      redirect(localizedPath(`/app/missions/${activeMission.id}`, locale));
    }
    redirect(localizedPath("/app", locale));
  }

  const showDocument = hasViewableDocument(contract, !!deliveredMission);

  const highlight = await (async () => {
    if (!showDocument) return null;

    const fromRendered = highlightFromRenderedContract({
      extractedText: contract.extractedText,
      draftAnswers: contract.draftAnswers,
    });
    if (fromRendered) return fromRendered;

    if (!contract.template) return null;
    let templateBody: string;
    try {
      templateBody = await loadTemplateBody({
        fileKey: contract.template.fileKey ?? null,
        fileName: contract.template.fileName ?? null,
        mimeType: contract.template.mimeType ?? null,
        placeholders: contract.template.placeholders,
      });
    } catch {
      return null;
    }
    return getContractHighlightData({
      templateBody,
      draftAnswers: contract.draftAnswers,
    });
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/app/contracts">{t("backToContracts")}</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{contract.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {reviewBarrister && <BarristerReviewedBy barrister={reviewBarrister} locale={locale} size="md" />}
          </div>
          {contract.userQuestion && (
            <p className="mt-2 text-sm text-muted-foreground">{contract.userQuestion}</p>
          )}
        </div>
      </div>

      {showDocument && (
        <ContractViewer
          title={t("documentPreview")}
          body={contract.extractedText}
          contractId={contract.id}
          highlight={highlight}
        />
      )}

      {!deliveredMission && !activeMission && (
        <ContractBarristerSubmitSection contractId={contract.id} />
      )}
    </div>
  );
}
