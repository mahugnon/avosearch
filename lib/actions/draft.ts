"use server";

import { ContractDraftStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { isDraftIntent, pickBestTemplate } from "@/lib/templates/match";
import {
  parseDraftAnswers,
  renderTemplateBody,
  validateDraftAnswers,
} from "@/lib/templates/render";
import { flattenTemplateFields, parseTemplateSteps } from "@/lib/templates/types";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export type DraftActionState = { error?: string } | undefined;

async function requireDraftContract(contractId: string) {
  const session = await auth();
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "CLIENT") {
    redirect(localizedPath("/login", locale));
  }

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { template: true },
  });

  if (
    !contract ||
    contract.ownerId !== session.user.id ||
    !contract.template ||
    contract.draftStatus !== ContractDraftStatus.IN_PROGRESS
  ) {
    redirect(localizedPath("/app", locale));
  }

  return { contract, locale };
}

export async function saveDraftFieldAction(
  contractId: string,
  fieldId: string,
  value: string
): Promise<DraftActionState> {
  const { contract } = await requireDraftContract(contractId);
  const answers = parseDraftAnswers(contract.draftAnswers);
  answers[fieldId] = value.trim();

  await prisma.contract.update({
    where: { id: contractId },
    data: { draftAnswers: answers },
  });

  return undefined;
}

export async function completeDraftAction(contractId: string): Promise<DraftActionState> {
  const { contract, locale } = await requireDraftContract(contractId);
  const steps = parseTemplateSteps(contract.template!.steps);
  const fields = flattenTemplateFields(steps);
  const answers = parseDraftAnswers(contract.draftAnswers);

  const validation = validateDraftAnswers(fields, answers);
  if (!validation.ok) {
    return { error: "missing_fields" };
  }

  const extractedText = renderTemplateBody(contract.template!.body, answers);

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      extractedText,
      draftStatus: ContractDraftStatus.COMPLETED,
    },
  });

  redirect(localizedPath(`/app/contracts/${contractId}?analyze=1`, locale));
}

export async function findTemplateForDraftQuestion(
  question: string,
  hasFile: boolean
) {
  if (!isDraftIntent(question, hasFile)) return null;

  const templates = await prisma.contractTemplate.findMany({
    where: { active: true },
    select: { id: true, slug: true, title: true, tags: true, domain: true },
  });

  return pickBestTemplate(question, templates);
}
