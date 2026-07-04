"use server";

import { ContractDraftStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth/client-session";
import {
  applyFieldDefaults,
  buildCompletionMessage,
  buildFieldQuestion,
  buildTemplateIntro,
  detectLawyerValidationIntent,
  getNextPendingField,
  normalizeFieldValue,
} from "@/lib/templates/draft-chat";
import { isDraftIntent, pickBestTemplate } from "@/lib/templates/match";
import { parseDraftAnswers, renderTemplateBody, validateDraftAnswers } from "@/lib/templates/render";
import { flattenTemplateFields, parseTemplateSteps } from "@/lib/templates/types";
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

  if (input.contractId) {
    return continueDraftChat(input.contractId, session.userId, message, input.history ?? []);
  }

  if (!isDraftIntent(message, false)) {
    return {
      assistantMessage: t("notDraftIntent"),
    };
  }

  const templates = await prisma.contractTemplate.findMany({
    where: { active: true },
    select: { id: true, slug: true, title: true, tags: true, domain: true, body: true, steps: true },
  });

  const template = pickBestTemplate(message, templates);
  if (!template) {
    return { assistantMessage: t("noTemplateMatch") };
  }

  const steps = parseTemplateSteps(template.steps);
  const fields = flattenTemplateFields(steps);
  const firstField = getNextPendingField(fields, {});

  if (!firstField) {
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

  const firstQuestion = buildFieldQuestion(firstField, 0, fields.length);
  return {
    contractId: contract.id,
    assistantMessage: buildTemplateIntro(template.title, firstQuestion),
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

  const steps = parseTemplateSteps(contract.template.steps);
  const fields = flattenTemplateFields(steps);
  let answers = parseDraftAnswers(contract.draftAnswers);
  const pending = getNextPendingField(fields, answers);

  if (pending) {
    answers[pending.id] = normalizeFieldValue(pending, message);
    await prisma.contract.update({
      where: { id: contractId },
      data: { draftAnswers: answers },
    });
  }

  const wantsLawyer = detectLawyerValidationIntent([...history, message].join("\n"));
  const next = getNextPendingField(fields, answers);

  if (next) {
    const answeredCount = fields.filter((f) => f.required && answers[f.id]?.trim()).length;
    const question = buildFieldQuestion(next, answeredCount, fields.length);
    return {
      contractId,
      assistantMessage: question,
      completed: false,
    };
  }

  answers = applyFieldDefaults(answers);
  const validation = validateDraftAnswers(fields, answers);
  if (!validation.ok) {
    return {
      contractId,
      assistantMessage: t("missingFields"),
      completed: false,
    };
  }

  const contractBody = renderTemplateBody(contract.template.body, answers);

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      extractedText: contractBody,
      draftAnswers: answers,
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

export async function resumeDraftChatAction(contractId: string): Promise<DraftChatResult | null> {
  const session = await getClientSession();
  if (!session.ok) return null;

  const contract = await loadDraftContract(contractId, session.userId);
  if (!contract?.template) return null;

  const steps = parseTemplateSteps(contract.template.steps);
  const fields = flattenTemplateFields(steps);
  const answers = parseDraftAnswers(contract.draftAnswers);
  const next = getNextPendingField(fields, answers);

  if (!next) return null;

  const answeredCount = fields.filter((f) => f.required && answers[f.id]?.trim()).length;
  return {
    contractId: contract.id,
    assistantMessage: buildFieldQuestion(next, answeredCount, fields.length),
    completed: false,
  };
}
