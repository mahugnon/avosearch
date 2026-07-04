import type { TemplateField } from "@/lib/templates/types";

export function getNextPendingField(
  fields: TemplateField[],
  answers: Record<string, string>
): TemplateField | null {
  for (const field of fields) {
    if (answers[field.id]?.trim()) continue;
    if (field.required) return field;
    if (field.chatPrompt) return field;
  }
  return null;
}

export function normalizeFieldValue(field: TemplateField, raw: string): string {
  const value = raw.trim();
  if (field.type === "number") {
    const digits = value.replace(/[^\d.,]/g, "").replace(",", ".");
    return digits || value;
  }
  return value;
}

export function applyFieldDefaults(answers: Record<string, string>): Record<string, string> {
  const next = { ...answers };
  if (!next.EFFECTIVE_DATE?.trim()) {
    next.EFFECTIVE_DATE = new Date().toLocaleDateString("fr-FR");
  }
  if (!next.DURATION_YEARS?.trim()) {
    next.DURATION_YEARS = "3";
  }
  return next;
}

export function buildFieldQuestion(field: TemplateField, fieldIndex: number, total: number): string {
  if (field.chatPrompt) return field.chatPrompt;
  const hint = field.placeholder ? ` (ex. ${field.placeholder})` : "";
  return `${field.label}${hint}`;
}

export function buildTemplateIntro(templateTitle: string, firstQuestion: string): string {
  return `Parfait — je vous propose le modèle « ${templateTitle} ». Une question à la fois.\n\n${firstQuestion}`;
}

export function buildCompletionMessage(wantsLawyerValidation: boolean): string {
  if (wantsLawyerValidation) {
    return "Votre contrat est prêt dans l’aperçu à droite. Vous avez demandé une validation avocat : lancez l’analyse pour obtenir une orientation, puis choisissez la formule avec validation avocat.";
  }
  return "Votre contrat est prêt — consultez l’aperçu à droite. Vous pouvez le relire et lancer l’analyse quand vous voulez.";
}

export function detectLawyerValidationIntent(text: string): boolean {
  return /\b(avocat|validation|valid[ée]r|relire|relecture)\b/i.test(text);
}
