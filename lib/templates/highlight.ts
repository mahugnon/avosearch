import { extractPlaceholderKeys, humanizePlaceholder } from "@/lib/templates/placeholders";
import { parseDraftAnswers } from "@/lib/templates/render";

export type HighlightField = {
  id: string;
  label: string;
};

export type ContractSegment =
  | { kind: "text"; content: string }
  | { kind: "field"; fieldId: string; label: string; value: string };

export type ContractHighlightData = {
  templateBody: string;
  fields: HighlightField[];
  answers: Record<string, string>;
};

export function buildContractSegments(
  templateBody: string,
  answers: Record<string, string>,
  fields: HighlightField[]
): ContractSegment[] {
  const labelById = Object.fromEntries(fields.map((f) => [f.id, f.label]));
  const segments: ContractSegment[] = [];
  const regex = /\{\{([A-Z0-9_]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(templateBody)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", content: templateBody.slice(lastIndex, match.index) });
    }
    const fieldId = match[1];
    const value = answers[fieldId]?.trim() || `[${fieldId}]`;
    segments.push({
      kind: "field",
      fieldId,
      label: labelById[fieldId] ?? humanizePlaceholder(fieldId),
      value,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < templateBody.length) {
    segments.push({ kind: "text", content: templateBody.slice(lastIndex) });
  }

  return segments;
}

export function getContractHighlightData(input: {
  templateBody?: string | null;
  draftAnswers?: unknown;
}): ContractHighlightData | null {
  if (!input.templateBody?.trim()) return null;

  const answers = parseDraftAnswers(input.draftAnswers);
  const fieldIds = extractPlaceholderKeys(input.templateBody);
  const fields = fieldIds.map((id) => ({ id, label: humanizePlaceholder(id) }));
  const hasFilledField = fields.some((field) => Boolean(answers[field.id]?.trim()));
  if (!hasFilledField) return null;

  return {
    templateBody: input.templateBody,
    fields,
    answers,
  };
}
