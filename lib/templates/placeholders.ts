const PLACEHOLDER_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

// Filled automatically — not asked one-by-one in chat.
// CONFIDENTIALITY_YEARS, AGREEMENT_DURATION and TERMINATION_NOTICE are
// intentionally collected (as radio questions, see lib/templates/field-meta.ts)
// so the NDA flow reads clearly; applyPlaceholderDefaults still backfills them
// if a draft completes without an explicit answer.
const DERIVED_PLACEHOLDER_KEYS = new Set([
  "PARTY_A_SHORT_NAME",
  "PARTY_B_SHORT_NAME",
  "SIGNATURE_PARTY_A_NAME",
  "SIGNATURE_PARTY_B_NAME",
  "EFFECTIVE_DATE",
  "DURATION_YEARS",
  "SIGNATURE_COPIES",
  "SIGNATURE_CITY",
  "DISPUTE_JURISDICTION",
  "CONFIDENTIAL_INFO_DEFINITION",
  "AUTHORIZED_PERSONNEL",
]);

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

export function collectablePlaceholders(placeholders: string[]): string[] {
  return placeholders.filter((key) => !DERIVED_PLACEHOLDER_KEYS.has(key));
}

/** Placeholders the user must still provide in chat (excludes auto-derived fields). */
export function collectableMissingPlaceholders(
  placeholders: string[],
  answers: Record<string, string>
): string[] {
  return collectablePlaceholders(placeholders).filter((key) => !answers[key]?.trim());
}

export function isDraftReadyToComplete(
  placeholders: string[],
  answers: Record<string, string>
): boolean {
  if (collectableMissingPlaceholders(placeholders, answers).length > 0) return false;
  const normalized = applyPlaceholderDefaults(answers);
  return missingPlaceholders(placeholders, normalized).length === 0;
}

function firstToken(value: string): string {
  const token = value.trim().split(/\s+/)[0];
  return token ?? value.trim();
}

export function applyPlaceholderDefaults(answers: Record<string, string>): Record<string, string> {
  const next = { ...answers };

  if (!next.PARTY_A_SHORT_NAME?.trim() && next.PARTY_A_NAME?.trim()) {
    next.PARTY_A_SHORT_NAME = firstToken(next.PARTY_A_NAME);
  }
  if (!next.PARTY_B_SHORT_NAME?.trim() && next.PARTY_B_NAME?.trim()) {
    next.PARTY_B_SHORT_NAME = firstToken(next.PARTY_B_NAME);
  }
  if (!next.SIGNATURE_PARTY_A_NAME?.trim()) {
    next.SIGNATURE_PARTY_A_NAME =
      next.PARTY_A_REPRESENTATIVE?.trim() || next.PARTY_A_NAME?.trim() || "";
  }
  if (!next.SIGNATURE_PARTY_B_NAME?.trim()) {
    next.SIGNATURE_PARTY_B_NAME =
      next.PARTY_B_REPRESENTATIVE?.trim() || next.PARTY_B_NAME?.trim() || "";
  }

  if (!next.EFFECTIVE_DATE?.trim()) {
    next.EFFECTIVE_DATE = new Date().toLocaleDateString("fr-FR");
  }
  if (!next.DURATION_YEARS?.trim()) {
    next.DURATION_YEARS = "3";
  }
  if (!next.CONFIDENTIALITY_YEARS?.trim()) {
    next.CONFIDENTIALITY_YEARS = next.DURATION_YEARS?.trim() || "3";
  }
  if (!next.AGREEMENT_DURATION?.trim()) {
    next.AGREEMENT_DURATION = `${next.DURATION_YEARS?.trim() || "3"} years`;
  }
  if (!next.TERMINATION_NOTICE?.trim()) {
    next.TERMINATION_NOTICE = "30 days";
  }
  if (!next.SIGNATURE_COPIES?.trim()) {
    next.SIGNATURE_COPIES = "2";
  }
  if (!next.SIGNATURE_CITY?.trim()) {
    next.SIGNATURE_CITY =
      next.PARTY_A_RCS_CITY?.trim() || next.PARTY_B_RCS_CITY?.trim() || "Paris";
  }
  if (!next.DISPUTE_JURISDICTION?.trim()) {
    next.DISPUTE_JURISDICTION =
      next.PARTY_A_RCS_CITY?.trim() || next.PARTY_B_RCS_CITY?.trim() || "Paris";
  }
  if (!next.CONFIDENTIAL_INFO_DEFINITION?.trim()) {
    next.CONFIDENTIAL_INFO_DEFINITION =
      "all technical, commercial and financial information exchanged between the Parties in connection with the Project";
  }
  if (!next.AUTHORIZED_PERSONNEL?.trim()) {
    next.AUTHORIZED_PERSONNEL =
      "employees, officers and professional advisors who need access for the Project and are bound by equivalent confidentiality obligations";
  }
  if (!next.PROJECT_DESCRIPTION?.trim()) {
    next.PROJECT_DESCRIPTION = "a business collaboration between the Parties";
  }

  return next;
}
