import { ContractDraftStatus } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DraftResumeChat } from "@/components/app/draft-resume-chat";
import { Button } from "@/components/ui/button";
import { requireClientContract } from "@/lib/contracts/access";
import { renderDraftPreview, getDraftPreviewHighlight } from "@/lib/templates/draft-preview";
import {
  humanizePlaceholder,
  collectableMissingPlaceholders,
} from "@/lib/templates/placeholders";
import { loadTemplateBody, resolveTemplatePlaceholders } from "@/lib/templates/load";
import { parseDraftAnswers } from "@/lib/templates/render";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { contract } = await requireClientContract(id);
  const t = await getTranslations("contracts.draft");
  return { title: `${t("pageTitle")} — ${contract.title}` };
}

export default async function ContractDraftPage({ params }: Props) {
  const { id, locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const { contract } = await requireClientContract(id);
  const t = await getTranslations("contracts.draft");

  if (contract.draftStatus !== ContractDraftStatus.IN_PROGRESS || !contract.template) {
    redirect(localizedPath(`/app/contracts/${id}`, locale));
  }

  const previewBody = await renderDraftPreview({
    template: contract.template,
    draftAnswers: contract.draftAnswers,
  });

  const templateBody = await loadTemplateBody(contract.template);
  const placeholders = resolveTemplatePlaceholders(contract.template, templateBody);
  const answers = parseDraftAnswers(contract.draftAnswers);
  const missing = collectableMissingPlaceholders(placeholders, answers);
  const initialAwaitingField = missing[0]
    ? { key: missing[0], label: humanizePlaceholder(missing[0]) }
    : undefined;

  const highlight = await getDraftPreviewHighlight({
    template: contract.template,
    draftAnswers: contract.draftAnswers,
  });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/app/contracts">{t("backToDashboard")}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{contract.title}</h1>
      </div>

      <DraftResumeChat
        contractId={contract.id}
        contractTitle={contract.title}
        initialPreviewBody={previewBody}
        initialAwaitingField={initialAwaitingField}
        userQuestion={contract.userQuestion}
        highlight={highlight}
      />
    </div>
  );
}
