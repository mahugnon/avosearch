export const MAX_CONTRACT_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_CONTRACT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export type AllowedContractMime = (typeof ALLOWED_CONTRACT_MIME_TYPES)[number];

export const ALLOWED_CONTRACT_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

export function mimeFromFilename(filename: string): AllowedContractMime | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".txt")) return "text/plain";
  return null;
}

export function isAllowedContractMime(mime: string): mime is AllowedContractMime {
  return (ALLOWED_CONTRACT_MIME_TYPES as readonly string[]).includes(mime);
}
