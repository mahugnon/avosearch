import {
  extractTextFromBuffer,
  isAllowedMimeType,
  type AllowedMimeType,
} from "@/lib/extract/text";
import { storage } from "@/lib/storage";

export type TemplateSource = {
  body: string | null;
  fileKey: string | null;
  fileName: string | null;
  mimeType: string | null;
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
  if (template.fileKey) {
    const buffer = await storage.read(template.fileKey);
    const mime = resolveTemplateMime(template.mimeType, template.fileName);
    return extractTextFromBuffer(buffer, mime);
  }

  if (template.body?.trim()) {
    return template.body;
  }

  throw new Error("TEMPLATE_BODY_MISSING");
}
