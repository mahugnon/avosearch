"use server";

import { randomUUID } from "crypto";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import {
  ALLOWED_CONTRACT_EXTENSIONS,
  isAllowedContractMime,
  MAX_CONTRACT_FILE_BYTES,
  mimeFromFilename,
} from "@/lib/contracts/constants";
import {
  extractTextFromBuffer,
  hasAnalyzableContent,
  TextExtractionError,
} from "@/lib/contracts/extract-text";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { storage } from "@/lib/storage";
import { createContractSchema } from "@/lib/validation/triage";
import { redirect } from "next/navigation";

export type CreateContractState = { error?: string } | undefined;

function inferTitle(filename: string | undefined, userQuestion: string | undefined): string {
  if (filename) {
    const base = filename.replace(/\.[^.]+$/, "").trim();
    if (base.length >= 3) return base.slice(0, 200);
  }
  if (userQuestion?.trim()) {
    const q = userQuestion.trim();
    return q.length > 80 ? `${q.slice(0, 77)}…` : q;
  }
  return "Contrat sans titre";
}

export async function createContractAction(
  _prev: CreateContractState,
  formData: FormData
): Promise<CreateContractState> {
  const session = await auth();
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("contracts.errors");

  if (!session?.user?.id || session.user.role !== "CLIENT") {
    return { error: t("unauthorized") };
  }

  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;

  const parsed = createContractSchema.safeParse({
    title: formData.get("title") || undefined,
    userQuestion: formData.get("userQuestion") || undefined,
    pastedText: formData.get("pastedText") || undefined,
  });

  if (!parsed.success) {
    return { error: t("invalidForm") };
  }

  const hasTextContent =
    Boolean(parsed.data.userQuestion?.trim()) || Boolean(parsed.data.pastedText?.trim());

  if (!hasFile && !hasTextContent) {
    return { error: t("contentRequired") };
  }

  let extractedText = parsed.data.pastedText?.trim() ?? "";
  let fileUrl: string | null = null;
  let mimeType: string | null = null;
  let filename: string | undefined;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CONTRACT_FILE_BYTES) {
      return { error: t("fileTooLarge") };
    }

    filename = file.name;
    const mime =
      (isAllowedContractMime(file.type) ? file.type : null) ?? mimeFromFilename(file.name);

    if (!mime) {
      return { error: t("unsupportedFile") };
    }

    const ext = ALLOWED_CONTRACT_EXTENSIONS.find((e) => file.name.toLowerCase().endsWith(e));
    if (!ext) {
      return { error: t("unsupportedFile") };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const fileText = await extractTextFromBuffer(buffer, mime);
      extractedText = extractedText ? `${extractedText}\n\n${fileText}` : fileText;
    } catch (error) {
      if (error instanceof TextExtractionError) {
        return { error: t("extractionFailed") };
      }
      throw error;
    }

    const storageKey = `contracts/${session.user.id}/${randomUUID()}${ext}`;
    await storage.save(storageKey, buffer, mime);
    fileUrl = storageKey;
    mimeType = mime;
  }

  if (!hasAnalyzableContent(extractedText, parsed.data.userQuestion)) {
    return { error: t("contentTooShort") };
  }

  const title =
    parsed.data.title?.trim() ||
    inferTitle(filename, parsed.data.userQuestion);

  const contract = await prisma.contract.create({
    data: {
      ownerId: session.user.id,
      title,
      fileUrl,
      mimeType,
      extractedText,
      userQuestion: parsed.data.userQuestion?.trim() || null,
    },
  });

  redirect(localizedPath(`/app/contracts/${contract.id}`, locale));
}
