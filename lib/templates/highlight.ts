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
  /** Pre-built segments when highlighting a rendered contract (no {{}} placeholders left). */
  segments?: ContractSegment[];
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

/** Highlights user-filled values inside the rendered contract when the template file is unavailable. */
export function highlightFromRenderedContract(input: {
  extractedText: string;
  draftAnswers?: unknown;
}): ContractHighlightData | null {
  const answers = parseDraftAnswers(input.draftAnswers);
  const entries = Object.entries(answers)
    .filter(([, value]) => value.trim())
    .map(([fieldId, value]) => ({
      fieldId,
      value: value.trim(),
      index: input.extractedText.indexOf(value.trim()),
    }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index || b.value.length - a.value.length);

  if (entries.length === 0) return null;

  const usedRanges: Array<{ start: number; end: number }> = [];
  const segments: ContractSegment[] = [];
  let cursor = 0;

  for (const entry of entries) {
    const start = entry.index;
    const end = start + entry.value.length;
    if (usedRanges.some((range) => start < range.end && end > range.start)) continue;
    usedRanges.push({ start, end });

    if (start > cursor) {
      segments.push({ kind: "text", content: input.extractedText.slice(cursor, start) });
    }
    segments.push({
      kind: "field",
      fieldId: entry.fieldId,
      label: humanizePlaceholder(entry.fieldId),
      value: entry.value,
    });
    cursor = end;
  }

  if (cursor < input.extractedText.length) {
    segments.push({ kind: "text", content: input.extractedText.slice(cursor) });
  }

  const fields = [...new Set(entries.map((entry) => entry.fieldId))].map((id) => ({
    id,
    label: humanizePlaceholder(id),
  }));

  return {
    templateBody: input.extractedText,
    fields,
    answers,
    segments,
  };
}
