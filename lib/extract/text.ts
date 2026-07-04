import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

const MAX_EXTRACTED_CHARS = 120_000;

export const ALLOWED_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
} as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[keyof typeof ALLOWED_MIME_TYPES];

export function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return Object.values(ALLOWED_MIME_TYPES).includes(mime as AllowedMimeType);
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\s+\n/g, "\n").trim();
}

function truncate(text: string): string {
  if (text.length <= MAX_EXTRACTED_CHARS) return text;
  return `${text.slice(0, MAX_EXTRACTED_CHARS)}\n\n[… texte tronqué pour l'analyse …]`;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: AllowedMimeType
): Promise<string> {
  let raw = "";

  switch (mimeType) {
    case ALLOWED_MIME_TYPES.pdf: {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      raw = Array.isArray(text) ? text.join("\n\n") : String(text ?? "");
      break;
    }
    case ALLOWED_MIME_TYPES.docx: {
      const result = await mammoth.extractRawText({ buffer });
      raw = result.value;
      break;
    }
    case ALLOWED_MIME_TYPES.txt:
      raw = buffer.toString("utf-8");
      break;
  }

  const normalized = normalizeText(raw);
  if (!normalized) {
    throw new Error("EMPTY_EXTRACTION");
  }
  return truncate(normalized);
}

export function titleFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 120);
}

export function titleFromQuestion(question: string): string {
  const trimmed = question.trim();
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 77)}…`;
}
