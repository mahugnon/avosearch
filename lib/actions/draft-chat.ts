"use server";

import { ContractDraftStatus, type ContractTemplate } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth/client-session";
import { runDraftStartWithLlm, runDraftTurnWithLlm } from "@/lib/ai/draft-chat-llm";
import { isAiConfigured } from "@/lib/ai/llm";
import {
  buildCompletionMessage,
  detectLawyerValidationIntent,
} from "@/lib/templates/draft-chat";
import { loadTemplateBody } from "@/lib/templates/load";
import {
  applyPlaceholderDefaults,
  extractPlaceholderKeys,
  missingPlaceholders,
} from "@/lib/templates/placeholders";
import {
  parseDraftAnswers,
  renderTemplateBody,
  validateDraftAnswers,
} from "@/lib/templates/render";
import { getTranslations } from "next-intl/server";

export type DraftChatResult = {
  contractId?: string;
  assistantMessage: string;
  completed?: boolean;
  contractBody?: string;
  contractTitle?: string;
  error?: string;
};

async function loadDraftContract(contractId: string, userId: string) {
  return prisma.contract.findFirst({
    where: {
      id: contractId,
      ownerId: userId,
      draftStatus: ContractDraftStatus.IN_PROGRESS,
      templateId: { not: null },
    },
    include: { template: true },
  });
}

async function resolveTemplateBody(template: ContractTemplate): Promise<string> {
  if (template.body?.trim()) return template.body;
  return loadTemplateBody(template);
}

async function buildTemplateCatalog(
  templates: Array<
    Pick<ContractTemplate, "slug" | "title" | "domain" | "tags" | "body" | "draftGuide" | "fileKey">
  >
) {
  return Promise.all(
    templates.map(async (template) => {
      let body = template.body ?? "";
      if (!body.trim() && template.fileKey) {
        try {
          body = await loadTemplateBody(template as ContractTemplate);
        } catch {
          body = "";
        }
      }
      return {
        slug: template.slug,
        title: template.title,
        domain: template.domain,
        tags: template.tags,
        placeholders: extractPlaceholderKeys(body),
        draftGuide: template.draftGuide,
      };
    })
  );
}

async function completeDraftContract(
  contractId: string,
  contract: NonNullable<Awaited<ReturnType<typeof loadDraftContract>>>,
  answers: Record<string, string>,
  history: string[],
  lastMessage: string
): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  let templateBody: string;
  try {
    templateBody = await resolveTemplateBody(contract.template!);
  } catch {
    return { contractId, assistantMessage: t("errors.templateLoadFailed"), completed: false };
  }

  const normalized = applyPlaceholderDefaults(answers);
  const validation = validateDraftAnswers(templateBody, normalized);
  if (!validation.ok) {
    return { contractId, assistantMessage: t("missingFields"), completed: false };
  }

  const contractBody = renderTemplateBody(templateBody, normalized);
  const wantsLawyer = detectLawyerValidationIntent([...history, lastMessage].join("\n"));

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      extractedText: contractBody,
      draftAnswers: normalized,
      draftStatus: ContractDraftStatus.COMPLETED,
    },
  });

  return {
    contractId,
    assistantMessage: buildCompletionMessage(wantsLawyer),
    completed: true,
    contractBody,
    contractTitle: contract.title,
  };
}

export async function draftChatAction(input: {
  contractId?: string;
  message: string;
  history?: string[];
}): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  const session = await getClientSession();
  if (!session.ok) {
    return { assistantMessage: "", error: session.reason };
  }

  const message = input.message.trim();
  if (!message) {
    return { assistantMessage: t("emptyMessage") };
  }

  if (!isAiConfigured()) {
    return { assistantMessage: t("errors.aiRequiredForDraft") };
  }

  if (input.contractId) {
    return continueDraftChat(input.contractId, session.userId, message, input.history ?? []);
  }

  const templates = await prisma.contractTemplate.findMany({
    where: { active: true },
    select: {
      id: true,
      slug: true,
      title: true,
      tags: true,
      domain: true,
      body: true,
      draftGuide: true,
      fileKey: true,
    },
  });

  const catalog = await buildTemplateCatalog(templates);
  const llmStart = await runDraftStartWithLlm({ userMessage: message, templates: catalog });

  if (!llmStart) {
    return { assistantMessage: t("errors.generic") };
  }

  if (!llmStart.result.is_draft_intent) {
    return { assistantMessage: t("notDraftIntent") };
  }

  const template = templates.find((item) => item.slug === llmStart.result.template_slug);
  if (!template) {
    return { assistantMessage: t("noTemplateMatch") };
  }

  const contract = await prisma.contract.create({
    data: {
      ownerId: session.userId,
      title: template.title,
      extractedText: "",
      userQuestion: message,
      templateId: template.id,
      draftAnswers: {},
      draftStatus: ContractDraftStatus.IN_PROGRESS,
    },
  });

  return {
    contractId: contract.id,
    assistantMessage: llmStart.result.assistant_message,
    completed: false,
  };
}

async function continueDraftChat(
  contractId: string,
  userId: string,
  message: string,
  history: string[]
): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  const contract = await loadDraftContract(contractId, userId);

  if (!contract?.template) {
    return { assistantMessage: t("sessionLost") };
  }

  let templateBody: string;
  try {
    templateBody = await resolveTemplateBody(contract.template);
  } catch {
    return { contractId, assistantMessage: t("errors.templateLoadFailed") };
  }

  const placeholders = extractPlaceholderKeys(templateBody);
  let answers = parseDraftAnswers(contract.draftAnswers);
  const missingBefore = missingPlaceholders(placeholders, answers);

  const llmTurn = await runDraftTurnWithLlm({
    templateTitle: contract.template.title,
    draftGuide: contract.template.draftGuide,
    templateExcerpt: templateBody,
    placeholders,
    missing: missingBefore,
    answers,
    userMessage: message,
    history,
  });

  if (!llmTurn) {
    return { contractId, assistantMessage: t("errors.generic") };
  }

  answers = { ...answers, ...llmTurn.result.collected };
  await prisma.contract.update({
    where: { id: contractId },
    data: { draftAnswers: answers },
  });

  const missingAfter = missingPlaceholders(placeholders, answers);
  const allFilled = missingAfter.length === 0;

  if (llmTurn.result.complete && allFilled) {
    return completeDraftContract(contractId, contract, answers, history, message);
  }

  if (allFilled) {
    return completeDraftContract(contractId, contract, answers, history, message);
  }

  return {
    contractId,
    assistantMessage: llmTurn.result.assistant_message,
    completed: false,
  };
}

export async function resumeDraftChatAction(contractId: string): Promise<DraftChatResult | null> {
  const session = await getClientSession();
  if (!session.ok || !isAiConfigured()) return null;

  const contract = await loadDraftContract(contractId, session.userId);
  if (!contract?.template) return null;

  let templateBody: string;
  try {
    templateBody = await resolveTemplateBody(contract.template);
  } catch {
    return null;
  }

  const placeholders = extractPlaceholderKeys(templateBody);
  const answers = parseDraftAnswers(contract.draftAnswers);
  const missing = missingPlaceholders(placeholders, answers);
  if (missing.length === 0) return null;

  const llmTurn = await runDraftTurnWithLlm({
    templateTitle: contract.template.title,
    draftGuide: contract.template.draftGuide,
    templateExcerpt: templateBody,
    placeholders,
    missing,
    answers,
    userMessage: "Reprends la conversation et pose la prochaine question.",
    history: [],
  });

  if (!llmTurn) return null;

  return {
    contractId: contract.id,
    assistantMessage: llmTurn.result.assistant_message,
    completed: false,
  };
}
