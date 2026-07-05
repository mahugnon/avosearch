"use server";

import { ContractDraftStatus, type ContractTemplate } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth/client-session";
import { runDraftFollowUpWithLlm, runDraftStartWithLlm, runDraftTurnWithLlm } from "@/lib/ai/draft-chat-llm";
import { isAiConfigured } from "@/lib/ai/llm";
import { titleFromQuestion } from "@/lib/extract/text";
import {
  loadTemplateBody,
  resolveTemplatePlaceholders,
  type TemplateSource,
} from "@/lib/templates/load";
import {
  applyPlaceholderDefaults,
  collectableMissingPlaceholders,
  isDraftReadyToComplete,
} from "@/lib/templates/placeholders";
import {
  resolveFieldMeta,
  type FieldInputType,
  type FieldOption,
} from "@/lib/templates/field-meta";
import { getDemoPresets, getDemoValue } from "@/lib/templates/demo-presets";
import {
  parseDraftAnswers,
  renderTemplateBody,
  validateDraftAnswers,
} from "@/lib/templates/render";
import { renderDraftPreview } from "@/lib/templates/draft-preview";
import { getTranslations, getLocale } from "next-intl/server";
import type { AppLocale } from "@/lib/i18n";

export type AwaitingField = {
  key: string;
  /** Clear, localized question shown to the user. */
  label: string;
  hint?: string;
  type?: FieldInputType;
  options?: FieldOption[];
  /** Preset example value for live demos (one-click fill). */
  demoValue?: string;
};

export type DraftPreview = {
  body: string;
  title: string;
  inProgress: boolean;
};

export type DraftChatResult = {
  contractId?: string;
  assistantMessage: string;
  completed?: boolean;
  contractBody?: string;
  contractTitle?: string;
  draftPreview?: DraftPreview;
  suggestBarrister?: boolean;
  inquiryMessage?: string;
  awaitingField?: AwaitingField;
  error?: string;
};

type DraftContractWithTemplate = NonNullable<Awaited<ReturnType<typeof loadDraftContract>>>;

const TEMPLATE_CATALOG_EXCERPT_CHARS = 4000;

function isContractRelatedMessage(message: string): boolean {
  return /\b(contract|contrat|nda|accord|agreement|employ|employee|salari|prestation|freelance|bail|lease|confidential)\b/i.test(
    message
  );
}

function awaitingFieldFromMissing(
  missing: string[],
  locale: AppLocale,
  templateSlug?: string | null
): AwaitingField | undefined {
  const key = missing[0];
  if (!key) return undefined;
  const meta = resolveFieldMeta(key, locale);
  return {
    key,
    label: meta.label,
    hint: meta.hint,
    type: meta.type,
    options: meta.options,
    demoValue: getDemoValue(templateSlug, key),
  };
}

/** The clear, localized question for a given placeholder key. */
function fieldQuestion(key: string, locale: AppLocale): string {
  return resolveFieldMeta(key, locale).label;
}

function missingForCollection(
  placeholders: string[],
  answers: Record<string, string>
): string[] {
  return collectableMissingPlaceholders(placeholders, answers);
}

async function buildDraftPreview(contract: DraftContractWithTemplate): Promise<DraftPreview | undefined> {
  if (!contract.template) return undefined;
  try {
    const body = await renderDraftPreview({
      template: contract.template,
      draftAnswers: contract.draftAnswers,
    });
    return { body, title: contract.title, inProgress: true };
  } catch {
    return undefined;
  }
}

async function persistDraftAnswers(
  contractId: string,
  contract: DraftContractWithTemplate,
  answers: Record<string, string>
): Promise<DraftPreview | undefined> {
  const draftPreview = await buildDraftPreview({ ...contract, draftAnswers: answers });
  await prisma.contract.update({
    where: { id: contractId },
    data: {
      draftAnswers: answers,
      ...(draftPreview ? { extractedText: draftPreview.body } : {}),
    },
  });
  return draftPreview;
}

async function barristerInquiryResponse(message: string): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  return {
    assistantMessage: t("noTemplateMatch"),
    suggestBarrister: true,
    inquiryMessage: message,
  };
}

export async function createBarristerInquiryContractAction(
  message: string
): Promise<{ contractId?: string; error?: string }> {
  const session = await getClientSession();
  if (!session.ok) return { error: session.reason };

  const trimmed = message.trim();
  if (!trimmed) return { error: "empty_message" };

  const contract = await prisma.contract.create({
    data: {
      ownerId: session.userId,
      title: titleFromQuestion(trimmed),
      extractedText: "",
      userQuestion: trimmed,
      draftStatus: null,
    },
  });

  return { contractId: contract.id };
}

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

async function loadCompletedContract(contractId: string, userId: string) {
  return prisma.contract.findFirst({
    where: {
      id: contractId,
      ownerId: userId,
      draftStatus: ContractDraftStatus.COMPLETED,
      templateId: { not: null },
    },
    include: { template: true },
  });
}

async function resolveTemplateBody(template: TemplateSource): Promise<string> {
  return loadTemplateBody(template);
}

async function buildTemplateCatalog(
  templates: Array<
    Pick<
      ContractTemplate,
      "slug" | "title" | "domain" | "tags" | "draftGuide" | "fileKey" | "fileName" | "mimeType" | "placeholders"
    >
  >
) {
  return Promise.all(
    templates.map(async (template) => {
      let templateExcerpt = "";
      try {
        const body = await loadTemplateBody(template);
        templateExcerpt = body.slice(0, TEMPLATE_CATALOG_EXCERPT_CHARS);
      } catch {
        templateExcerpt = "";
      }

      return {
        slug: template.slug,
        title: template.title,
        domain: template.domain,
        tags: template.tags,
        placeholders: template.placeholders,
        draftGuide: template.draftGuide,
        templateExcerpt,
      };
    })
  );
}

async function completeDraftContract(
  contractId: string,
  contract: NonNullable<Awaited<ReturnType<typeof loadDraftContract>>>,
  answers: Record<string, string>
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
    assistantMessage: t("contractReady"),
    completed: true,
    contractBody,
    contractTitle: contract.title,
  };
}

export async function draftChatAction(input: {
  contractId?: string;
  message: string;
  history?: string[];
  fieldKey?: string;
}): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  const locale = (await getLocale()) as AppLocale;
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
    return continueDraftChat(
      input.contractId,
      session.userId,
      message,
      input.history ?? [],
      input.fieldKey
    );
  }

  const templates = await prisma.contractTemplate.findMany({
    where: { active: true },
    select: {
      id: true,
      slug: true,
      title: true,
      tags: true,
      domain: true,
      draftGuide: true,
      fileKey: true,
      fileName: true,
      mimeType: true,
      placeholders: true,
    },
  });

  const catalog = await buildTemplateCatalog(templates);
  const llmStart = await runDraftStartWithLlm({ locale, userMessage: message, templates: catalog });

  if (!llmStart) {
    return { assistantMessage: t("errors.generic") };
  }

  if (!llmStart.result.is_draft_intent) {
    if (isContractRelatedMessage(message)) {
      return barristerInquiryResponse(message);
    }
    return { assistantMessage: t("notDraftIntent") };
  }

  const template = templates.find((item) => item.slug === llmStart.result.template_slug);
  if (!template) {
    return barristerInquiryResponse(message);
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

  let awaitingField: AwaitingField | undefined;
  let draftPreview: DraftPreview | undefined;
  try {
    const templateBody = await resolveTemplateBody(template);
    const placeholders = resolveTemplatePlaceholders(template, templateBody);
    awaitingField = awaitingFieldFromMissing(missingForCollection(placeholders, {}), locale, template.slug);
    draftPreview = await buildDraftPreview({
      ...contract,
      template,
    } as DraftContractWithTemplate);
  } catch {
    awaitingField = undefined;
    draftPreview = undefined;
  }

  return {
    contractId: contract.id,
    assistantMessage: llmStart.result.assistant_message,
    completed: false,
    awaitingField,
    draftPreview,
    contractTitle: contract.title,
  };
}

async function applyDirectFieldAnswer(
  contractId: string,
  contract: DraftContractWithTemplate,
  placeholders: string[],
  answers: Record<string, string>,
  fieldKey: string,
  value: string
): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  const locale = (await getLocale()) as AppLocale;
  const nextAnswers = { ...answers, [fieldKey]: value.trim() };

  let draftPreview: DraftPreview | undefined;
  try {
    draftPreview = await persistDraftAnswers(contractId, contract, nextAnswers);
  } catch {
    return {
      contractId,
      assistantMessage: t("errors.generic"),
      awaitingField: awaitingFieldFromMissing(missingForCollection(placeholders, answers), locale, contract.template?.slug),
    };
  }

  const missingAfter = missingForCollection(placeholders, nextAnswers);
  if (isDraftReadyToComplete(placeholders, nextAnswers)) {
    return completeDraftContract(contractId, contract, nextAnswers);
  }

  const nextKey = missingAfter[0]!;
  return {
    contractId,
    assistantMessage: t("field.nextQuestion", { label: fieldQuestion(nextKey, locale) }),
    completed: false,
    awaitingField: awaitingFieldFromMissing(missingAfter, locale, contract.template?.slug),
    draftPreview,
    contractTitle: contract.title,
  };
}

async function continueDraftChat(
  contractId: string,
  userId: string,
  message: string,
  history: string[],
  fieldKey?: string
): Promise<DraftChatResult> {
  const completed = await loadCompletedContract(contractId, userId);
  if (completed) {
    return continueCompletedDraftChat(completed, message, history);
  }

  const t = await getTranslations("chat");
  const locale = (await getLocale()) as AppLocale;
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

  const placeholders = resolveTemplatePlaceholders(contract.template, templateBody);
  let answers = parseDraftAnswers(contract.draftAnswers);
  const missingBefore = missingForCollection(placeholders, answers);

  if (fieldKey && missingBefore.includes(fieldKey)) {
    return applyDirectFieldAnswer(
      contractId,
      contract,
      placeholders,
      answers,
      fieldKey,
      message
    );
  }

  const llmTurn = await runDraftTurnWithLlm({
    locale,
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
    const currentKey = missingBefore[0];
    if (currentKey) {
      const draftPreview = await buildDraftPreview(contract);
      return {
        contractId,
        assistantMessage: t("field.retryQuestion", { label: fieldQuestion(currentKey, locale) }),
        awaitingField: awaitingFieldFromMissing(missingBefore, locale, contract.template?.slug),
        draftPreview,
        contractTitle: contract.title,
      };
    }
    return {
      contractId,
      assistantMessage: t("errors.generic"),
      awaitingField: awaitingFieldFromMissing(missingBefore, locale, contract.template?.slug),
    };
  }

  answers = { ...answers, ...llmTurn.result.collected };

  let draftPreview: DraftPreview | undefined;
  try {
    draftPreview = await persistDraftAnswers(contractId, contract, answers);
  } catch {
    return {
      contractId,
      assistantMessage: t("errors.generic"),
      awaitingField: awaitingFieldFromMissing(missingForCollection(placeholders, answers), locale, contract.template?.slug),
    };
  }

  const missingAfter = missingForCollection(placeholders, answers);
  if (isDraftReadyToComplete(placeholders, answers)) {
    return completeDraftContract(contractId, contract, answers);
  }

  return {
    contractId,
    assistantMessage: llmTurn.result.assistant_message,
    completed: false,
    awaitingField: awaitingFieldFromMissing(missingAfter, locale, contract.template?.slug),
    draftPreview,
    contractTitle: contract.title,
  };
}

async function continueCompletedDraftChat(
  contract: NonNullable<Awaited<ReturnType<typeof loadCompletedContract>>>,
  message: string,
  history: string[]
): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  const locale = (await getLocale()) as AppLocale;

  if (!contract.template) {
    return { contractId: contract.id, assistantMessage: t("errors.generic") };
  }

  let templateBody: string;
  try {
    templateBody = await resolveTemplateBody(contract.template);
  } catch {
    return { contractId: contract.id, assistantMessage: t("errors.templateLoadFailed") };
  }

  const placeholders = resolveTemplatePlaceholders(contract.template, templateBody);
  const answers = parseDraftAnswers(contract.draftAnswers);

  const llm = await runDraftFollowUpWithLlm({
    locale,
    contractTitle: contract.title,
    contractBody: contract.extractedText,
    placeholders,
    answers,
    userMessage: message,
    history,
  });

  if (!llm) {
    return { contractId: contract.id, assistantMessage: t("errors.generic") };
  }

  let contractBody = contract.extractedText;
  const collected = llm.result.collected ?? {};

  if (Object.keys(collected).length > 0) {
    const nextAnswers = applyPlaceholderDefaults({ ...answers, ...collected });
    contractBody = renderTemplateBody(templateBody, nextAnswers);

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        draftAnswers: nextAnswers,
        extractedText: contractBody,
      },
    });
  }

  return {
    contractId: contract.id,
    assistantMessage: llm.result.assistant_message,
    completed: true,
    contractBody,
    contractTitle: contract.title,
  };
}

export type DraftSessionState = {
  contractId: string;
  contractTitle: string;
  completed: boolean;
  draftPreview?: DraftPreview;
  awaitingField?: AwaitingField;
  contractBody?: string;
};

async function sessionStateForInProgressContract(
  contract: DraftContractWithTemplate
): Promise<DraftSessionState | null> {
  if (!contract.template) return null;

  let templateBody: string;
  try {
    templateBody = await resolveTemplateBody(contract.template);
  } catch {
    return null;
  }

  const locale = (await getLocale()) as AppLocale;
  const placeholders = resolveTemplatePlaceholders(contract.template, templateBody);
  const answers = parseDraftAnswers(contract.draftAnswers);
  const missing = missingForCollection(placeholders, answers);
  const draftPreview = await buildDraftPreview(contract);

  return {
    contractId: contract.id,
    contractTitle: contract.title,
    completed: false,
    draftPreview,
    awaitingField: awaitingFieldFromMissing(missing, locale, contract.template?.slug),
  };
}

export async function getDraftSessionStateAction(
  contractId: string
): Promise<DraftSessionState | null> {
  const session = await getClientSession();
  if (!session.ok) return null;

  const inProgress = await loadDraftContract(contractId, session.userId);
  if (inProgress) {
    return sessionStateForInProgressContract(inProgress);
  }

  const completed = await loadCompletedContract(contractId, session.userId);
  if (!completed) return null;

  return {
    contractId: completed.id,
    contractTitle: completed.title,
    completed: true,
    contractBody: completed.extractedText,
    draftPreview: {
      body: completed.extractedText,
      title: completed.title,
      inProgress: false,
    },
  };
}

export async function resumeDraftChatAction(contractId: string): Promise<DraftChatResult | null> {
  const session = await getClientSession();
  if (!session.ok || !isAiConfigured()) return null;

  const locale = (await getLocale()) as AppLocale;
  const contract = await loadDraftContract(contractId, session.userId);
  if (!contract?.template) return null;

  let templateBody: string;
  try {
    templateBody = await resolveTemplateBody(contract.template);
  } catch {
    return null;
  }

  const placeholders = resolveTemplatePlaceholders(contract.template, templateBody);
  const answers = parseDraftAnswers(contract.draftAnswers);
  const missing = missingForCollection(placeholders, answers);
  if (missing.length === 0) return null;

  const draftPreview = await buildDraftPreview(contract);
  const awaitingField = awaitingFieldFromMissing(missing, locale, contract.template?.slug);

  const resumePrompt =
    locale === "en"
      ? "Resume the conversation and ask the next question."
      : "Reprends la conversation et pose la prochaine question.";

  const llmTurn = await runDraftTurnWithLlm({
    locale,
    templateTitle: contract.template.title,
    draftGuide: contract.template.draftGuide,
    templateExcerpt: templateBody,
    placeholders,
    missing,
    answers,
    userMessage: resumePrompt,
    history: [],
  });

  if (!llmTurn) {
    const nextKey = missing[0];
    if (!nextKey) return null;
    const t = await getTranslations("chat");
    return {
      contractId: contract.id,
      assistantMessage: t("field.resumeQuestion", { label: fieldQuestion(nextKey, locale) }),
      completed: false,
      awaitingField,
      draftPreview,
      contractTitle: contract.title,
    };
  }

  return {
    contractId: contract.id,
    assistantMessage: llmTurn.result.assistant_message,
    completed: false,
    awaitingField,
    draftPreview,
    contractTitle: contract.title,
  };
}

/**
 * Live-demo helper: fill the current draft with the template's preset demo
 * answers in one click. Completes the contract if all required fields are then
 * present, otherwise advances to the next remaining question.
 */
export async function prefillDraftDemoAction(contractId: string): Promise<DraftChatResult> {
  const t = await getTranslations("chat");
  const locale = (await getLocale()) as AppLocale;
  const session = await getClientSession();
  if (!session.ok) return { assistantMessage: "", error: session.reason };

  const contract = await loadDraftContract(contractId, session.userId);
  if (!contract?.template) {
    return { contractId, assistantMessage: t("sessionLost") };
  }

  let templateBody: string;
  try {
    templateBody = await resolveTemplateBody(contract.template);
  } catch {
    return { contractId, assistantMessage: t("errors.templateLoadFailed") };
  }

  const placeholders = resolveTemplatePlaceholders(contract.template, templateBody);
  const presets = getDemoPresets(contract.template.slug);
  if (Object.keys(presets).length === 0) {
    return { contractId, assistantMessage: t("errors.noDemoPreset") };
  }

  // Only fill collectable fields the user would otherwise be asked for.
  const collectable = new Set(missingForCollection(placeholders, {}).concat(
    placeholders.filter((key) => presets[key])
  ));
  const answers = { ...parseDraftAnswers(contract.draftAnswers) };
  for (const [key, value] of Object.entries(presets)) {
    if (collectable.has(key)) answers[key] = value;
  }

  let draftPreview: DraftPreview | undefined;
  try {
    draftPreview = await persistDraftAnswers(contractId, contract, answers);
  } catch {
    return { contractId, assistantMessage: t("errors.generic") };
  }

  if (isDraftReadyToComplete(placeholders, answers)) {
    return completeDraftContract(contractId, contract, answers);
  }

  const missingAfter = missingForCollection(placeholders, answers);
  const nextKey = missingAfter[0];
  return {
    contractId,
    assistantMessage: nextKey
      ? t("field.nextQuestion", { label: fieldQuestion(nextKey, locale) })
      : t("field.demoFilled"),
    completed: false,
    awaitingField: awaitingFieldFromMissing(missingAfter, locale, contract.template.slug),
    draftPreview,
    contractTitle: contract.title,
  };
}
