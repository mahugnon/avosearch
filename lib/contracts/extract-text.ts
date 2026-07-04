import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import type { AllowedContractMime } from "./constants";

export class TextExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TextExtractionError";
  }
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: AllowedContractMime
): Promise<string> {
  switch (mimeType) {
    case "text/plain":
      return buffer.toString("utf-8").trim();
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }
    case "application/pdf": {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return text.trim();
    }
    default:
      throw new TextExtractionError("Unsupported file type.");
  }
}

export function hasAnalyzableContent(extractedText: string, userQuestion?: string | null): boolean {
  const text = extractedText.trim();
  const question = userQuestion?.trim() ?? "";
  return text.length >= 50 || question.length >= 20;
}
