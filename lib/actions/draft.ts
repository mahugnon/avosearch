"use server";

import { ContractDraftStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { isDraftIntent, pickBestTemplate } from "@/lib/templates/match";
import { loadTemplateBody } from "@/lib/templates/load";
import {
  applyPlaceholderDefaults,
  parseDraftAnswers,
  renderTemplateBody,
  validateDraftAnswers,
} from "@/lib/templates/render";
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

export async function completeDraftAction(contractId: string): Promise<DraftActionState> {
  const { contract, locale } = await requireDraftContract(contractId);
  const answers = applyPlaceholderDefaults(parseDraftAnswers(contract.draftAnswers));

  let templateBody: string;
  try {
    templateBody = await loadTemplateBody(contract.template!);
  } catch {
    return { error: "template_load_failed" };
  }

  const validation = validateDraftAnswers(templateBody, answers);
  if (!validation.ok) {
    return { error: "missing_fields" };
  }

  const extractedText = renderTemplateBody(templateBody, answers);

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      extractedText,
      draftStatus: ContractDraftStatus.COMPLETED,
    },
  });

  redirect(localizedPath(`/app/contracts/${contractId}?analyze=1`, locale));
}

export async function findTemplateForDraftQuestion(question: string, hasFile: boolean) {
  if (!isDraftIntent(question, hasFile)) return null;

  const templates = await prisma.contractTemplate.findMany({
    where: { active: true },
    select: { id: true, slug: true, title: true, tags: true, domain: true },
  });

  return pickBestTemplate(question, templates);
}
