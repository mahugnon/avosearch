import type { TemplateField } from "@/lib/templates/types";

export function renderTemplateBody(
  body: string,
  answers: Record<string, string>
): string {
  return body.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key: string) => {
    const value = answers[key]?.trim();
    return value && value.length > 0 ? value : `[${key}]`;
  });
}

export function validateDraftAnswers(
  fields: TemplateField[],
  answers: Record<string, string>
): { ok: true } | { ok: false; fieldId: string; message: string } {
  for (const field of fields) {
    if (!field.required) continue;
    const value = answers[field.id]?.trim();
    if (!value) {
      return { ok: false, fieldId: field.id, message: "required" };
    }
  }
  return { ok: true };
}

export function parseDraftAnswers(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}
