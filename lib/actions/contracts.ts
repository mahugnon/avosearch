"use server";

import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  extractTextFromBuffer,
  isAllowedMimeType,
  titleFromFilename,
  titleFromQuestion,
} from "@/lib/extract/text";
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
  const session = await auth();
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("contracts.errors");

  if (!session || session.user.role !== "CLIENT") {
    return { error: t("unauthorized") };
  }

  const userQuestion = String(formData.get("userQuestion") ?? "").trim();
  const file = formData.get("file");

  if (!userQuestion && !(file instanceof File && file.size > 0)) {
    return { error: t("missingInput") };
  }

  let extractedText = userQuestion;
  let fileUrl: string | undefined;
  let mimeType: string | undefined;
  let title = userQuestion ? titleFromQuestion(userQuestion) : "Contrat";

  if (file instanceof File && file.size > 0) {
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

    const storageKey = `contracts/${session.user.id}/${randomUUID()}-${file.name}`;
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
      ownerId: session.user.id,
      title,
      extractedText,
      userQuestion: userQuestion || null,
      fileUrl: fileUrl ?? null,
      mimeType: mimeType ?? null,
    },
  });

  redirect(localizedPath(`/app/contracts/${contract.id}?analyze=1`, locale));
}
