"use server";

import { randomUUID } from "crypto";
import { ContractDraftStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  extractTextFromBuffer,
  isAllowedMimeType,
  titleFromFilename,
  titleFromQuestion,
} from "@/lib/extract/text";
import { findTemplateForDraftQuestion } from "@/lib/actions/draft";
import { getClientSession } from "@/lib/auth/client-session";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type CreateContractState = { error?: string } | undefined;

export async function createContractAction(
  _prev: CreateContractState,
  formData: FormData
): Promise<CreateContractState> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("contracts.errors");

  const session = await getClientSession();
  if (!session.ok) {
    return { error: t(session.reason) };
  }

  const userQuestion = String(formData.get("userQuestion") ?? "").trim();
  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;

  if (!userQuestion && !hasFile) {
    return { error: t("missingInput") };
  }

  const templateMatch = await findTemplateForDraftQuestion(userQuestion, hasFile);
  if (templateMatch) {
    const contract = await prisma.contract.create({
      data: {
        ownerId: session.userId,
        title: templateMatch.title,
        extractedText: "",
        userQuestion: userQuestion || null,
        templateId: templateMatch.id,
        draftAnswers: {},
        draftStatus: ContractDraftStatus.IN_PROGRESS,
      },
    });
    redirect(localizedPath(`/app/contracts/${contract.id}/draft`, locale));
  }

  let extractedText = userQuestion;
  let fileUrl: string | undefined;
  let mimeType: string | undefined;
  let title = userQuestion ? titleFromQuestion(userQuestion) : "Contrat";

  if (hasFile) {
    if (file.size > MAX_FILE_BYTES) {
      return { error: t("fileTooLarge") };
    }
    if (!isAllowedMimeType(file.type)) {
      return { error: t("unsupportedFile") };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const fileText = await extractTextFromBuffer(buffer, file.type);
      extractedText = userQuestion
        ? `${userQuestion}\n\n---\n\n${fileText}`
        : fileText;
    } catch {
      return { error: t("extractionFailed") };
    }

    const storageKey = `contracts/${session.userId}/${randomUUID()}-${file.name}`;
    await storage.save(storageKey, buffer, file.type);
    fileUrl = storageKey;
    mimeType = file.type;
    title = titleFromFilename(file.name);
    if (userQuestion) {
      title = `${title} — ${titleFromQuestion(userQuestion)}`.slice(0, 120);
    }
  }

  if (!extractedText.trim()) {
    return { error: t("missingInput") };
  }

  const contract = await prisma.contract.create({
    data: {
      ownerId: session.userId,
      title,
      extractedText,
      userQuestion: userQuestion || null,
      fileUrl: fileUrl ?? null,
      mimeType: mimeType ?? null,
    },
  });

  redirect(localizedPath(`/app/contracts/${contract.id}`, locale));
}
