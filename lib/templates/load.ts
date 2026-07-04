import {
  extractTextFromBuffer,
  isAllowedMimeType,
  type AllowedMimeType,
} from "@/lib/extract/text";
import { storage } from "@/lib/storage";
import { extractPlaceholderKeys } from "@/lib/templates/placeholders";

export type TemplateSource = {
  fileKey: string | null;
  fileName: string | null;
  mimeType: string | null;
  placeholders?: string[];
};

export function mimeFromFilename(filename: string): AllowedMimeType | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "txt") return "text/plain";
  return null;
}

export function resolveTemplateMime(mimeType: string | null, fileName: string | null): AllowedMimeType {
  if (mimeType && isAllowedMimeType(mimeType)) return mimeType;
  const fromName = fileName ? mimeFromFilename(fileName) : null;
  if (fromName) return fromName;
  throw new Error("UNSUPPORTED_MIME");
}

export async function loadTemplateBody(template: TemplateSource): Promise<string> {
  if (!template.fileKey) {
    throw new Error("TEMPLATE_FILE_MISSING");
  }

  const buffer = await storage.read(template.fileKey);
  const mime = resolveTemplateMime(template.mimeType, template.fileName);
  return extractTextFromBuffer(buffer, mime);
}

export async function extractPlaceholdersFromBuffer(
  buffer: Buffer,
  mimeType: AllowedMimeType
): Promise<{ text: string; placeholders: string[] }> {
  const text = await extractTextFromBuffer(buffer, mimeType);
  return { text, placeholders: extractPlaceholderKeys(text) };
}

export function resolveTemplatePlaceholders(
  template: TemplateSource,
  extractedText: string
): string[] {
  if (template.placeholders && template.placeholders.length > 0) {
    return template.placeholders;
  }
  return extractPlaceholderKeys(extractedText);
}
