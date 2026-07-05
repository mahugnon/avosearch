import {
  applyPlaceholderDefaults,
  extractPlaceholderKeys,
  missingPlaceholders,
} from "@/lib/templates/placeholders";

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
  body: string,
  answers: Record<string, string>
): { ok: true } | { ok: false; missing: string[] } {
  const placeholders = extractPlaceholderKeys(body);
  const normalized = applyPlaceholderDefaults(answers);
  const missing = missingPlaceholders(placeholders, normalized);
  if (missing.length > 0) {
    return { ok: false, missing };
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

export { applyPlaceholderDefaults, extractPlaceholderKeys, missingPlaceholders };
