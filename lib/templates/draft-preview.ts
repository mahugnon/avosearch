import type { ContractTemplate } from "@prisma/client";
import { loadTemplateBody } from "@/lib/templates/load";
import { applyPlaceholderDefaults } from "@/lib/templates/placeholders";
import { parseDraftAnswers, renderTemplateBody } from "@/lib/templates/render";
import { getContractHighlightData } from "@/lib/templates/highlight";
import type { ContractHighlightData } from "@/lib/templates/highlight";

type TemplateSource = Pick<
  ContractTemplate,
  "fileKey" | "fileName" | "mimeType" | "placeholders"
>;

export async function renderDraftPreview(input: {
  template: TemplateSource;
  draftAnswers: unknown;
}): Promise<string> {
  const templateBody = await loadTemplateBody(input.template);
  const answers = applyPlaceholderDefaults(parseDraftAnswers(input.draftAnswers));
  return renderTemplateBody(templateBody, answers);
}

export async function getDraftPreviewHighlight(input: {
  template: TemplateSource;
  draftAnswers: unknown;
}): Promise<ContractHighlightData | null> {
  const answers = parseDraftAnswers(input.draftAnswers);
  if (Object.keys(answers).length === 0) return null;

  try {
    const templateBody = await loadTemplateBody(input.template);
    return getContractHighlightData({ templateBody, draftAnswers: answers });
  } catch {
    return null;
  }
}
