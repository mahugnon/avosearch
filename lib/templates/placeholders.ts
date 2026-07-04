const PLACEHOLDER_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

export function extractPlaceholderKeys(body: string): string[] {
  const keys = new Set<string>();
  for (const match of body.matchAll(PLACEHOLDER_PATTERN)) {
    keys.add(match[1]!);
  }
  return [...keys];
}

export function humanizePlaceholder(key: string): string {
  return key
    .toLowerCase()
    .split("_")
    .join(" ");
}

export function missingPlaceholders(
  placeholders: string[],
  answers: Record<string, string>
): string[] {
  return placeholders.filter((key) => !answers[key]?.trim());
}

export function applyPlaceholderDefaults(answers: Record<string, string>): Record<string, string> {
  const next = { ...answers };
  if (!next.EFFECTIVE_DATE?.trim()) {
    next.EFFECTIVE_DATE = new Date().toLocaleDateString("fr-FR");
  }
  if (!next.DURATION_YEARS?.trim()) {
    next.DURATION_YEARS = "3";
  }
  return next;
}
