"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  isAllowedMimeType,
  type AllowedMimeType,
} from "@/lib/extract/text";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { mimeFromFilename } from "@/lib/templates/load";
import {
  parseTagsInput,
  templateMetadataSchema,
} from "@/lib/validation/template-admin";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_TEMPLATE_BYTES = 10 * 1024 * 1024;

export type TemplateFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

function revalidateTemplatePaths() {
  revalidatePath("/admin/templates");
  revalidatePath("/admin");
}

function resolveFileMime(file: File): AllowedMimeType | null {
  if (isAllowedMimeType(file.type)) return file.type;
  return mimeFromFilename(file.name);
}

function templateStorageKey(slug: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return `templates/${slug}/${Date.now()}-${safeName}`;
}

function parseMetadata(formData: FormData) {
  const tags = parseTagsInput(String(formData.get("tags") ?? ""));
  const draftGuide = String(formData.get("draftGuide") ?? "").trim();

  const parsed = templateMetadataSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    domain: String(formData.get("domain") ?? "").trim(),
    tags,
    draftGuide: draftGuide || undefined,
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") fieldErrors[key] = issue.message;
    }
    return { error: "validation_failed" as const, fieldErrors };
  }

  return { data: parsed.data };
}

async function readTemplateFile(
  formData: FormData,
  required: boolean
): Promise<
  | { error: string }
  | { buffer: Buffer; mimeType: AllowedMimeType; fileName: string }
  | { buffer: null }
> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    if (required) return { error: "file_required" };
    return { buffer: null };
  }

  if (file.size > MAX_TEMPLATE_BYTES) return { error: "file_too_large" };

  const mimeType = resolveFileMime(file);
  if (!mimeType) return { error: "file_type_invalid" };

  const buffer = Buffer.from(await file.arrayBuffer());
  return { buffer, mimeType, fileName: file.name };
}

export async function createTemplateAction(
  _prev: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const session = await requireAdmin();
  if (!session) return { error: "unauthorized" };

  const meta = parseMetadata(formData);
  if (!("data" in meta) || !meta.data) {
    return { error: meta.error ?? "validation_failed", fieldErrors: meta.fieldErrors };
  }
  const { data } = meta;

  const existing = await prisma.contractTemplate.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (existing) return { error: "slug_taken" };

  const fileResult = await readTemplateFile(formData, true);
  if ("error" in fileResult) return { error: fileResult.error };
  if (!fileResult.buffer) return { error: "file_required" };

  const fileKey = templateStorageKey(data.slug, fileResult.fileName);
  await storage.save(fileKey, fileResult.buffer);

  await prisma.contractTemplate.create({
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      domain: data.domain,
      tags: data.tags,
      draftGuide: data.draftGuide ?? null,
      active: data.active,
      fileKey,
      fileName: fileResult.fileName,
      mimeType: fileResult.mimeType,
    },
  });

  revalidateTemplatePaths();
  const locale = (await getLocale()) as AppLocale;
  redirect(localizedPath("/admin/templates", locale));
}

export async function updateTemplateAction(
  templateId: string,
  _prev: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const session = await requireAdmin();
  if (!session) return { error: "unauthorized" };

  const current = await prisma.contractTemplate.findUnique({ where: { id: templateId } });
  if (!current) return { error: "not_found" };

  const meta = parseMetadata(formData);
  if (!("data" in meta) || !meta.data) {
    return { error: meta.error ?? "validation_failed", fieldErrors: meta.fieldErrors };
  }
  const { data } = meta;

  if (data.slug !== current.slug) {
    const slugTaken = await prisma.contractTemplate.findFirst({
      where: { slug: data.slug, NOT: { id: templateId } },
      select: { id: true },
    });
    if (slugTaken) return { error: "slug_taken" };
  }

  const fileResult = await readTemplateFile(formData, false);
  if ("error" in fileResult) return { error: fileResult.error };

  let fileKey = current.fileKey;
  let fileName = current.fileName;
  let mimeType = current.mimeType;

  if (fileResult.buffer) {
    const newKey = templateStorageKey(data.slug, fileResult.fileName);
    await storage.save(newKey, fileResult.buffer);
    if (current.fileKey) {
      await storage.delete(current.fileKey).catch(() => undefined);
    }
    fileKey = newKey;
    fileName = fileResult.fileName;
    mimeType = fileResult.mimeType;
  }

  await prisma.contractTemplate.update({
    where: { id: templateId },
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      domain: data.domain,
      tags: data.tags,
      draftGuide: data.draftGuide ?? null,
      active: data.active,
      fileKey,
      fileName,
      mimeType,
    },
  });

  revalidateTemplatePaths();
  const locale = (await getLocale()) as AppLocale;
  redirect(localizedPath("/admin/templates", locale));
}

export async function toggleTemplateActiveAction(templateId: string): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const template = await prisma.contractTemplate.findUnique({
    where: { id: templateId },
    select: { active: true },
  });
  if (!template) return;

  await prisma.contractTemplate.update({
    where: { id: templateId },
    data: { active: !template.active },
  });

  revalidateTemplatePaths();
}

export async function deleteTemplateAction(templateId: string): Promise<void> {
  const session = await requireAdmin();
  if (!session) return;

  const template = await prisma.contractTemplate.findUnique({
    where: { id: templateId },
    select: { fileKey: true },
  });
  if (!template) return;

  await prisma.contractTemplate.delete({ where: { id: templateId } });
  if (template.fileKey) {
    await storage.delete(template.fileKey).catch(() => undefined);
  }

  revalidateTemplatePaths();
}
