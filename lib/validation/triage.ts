import { z } from "zod";

const triageEnum = z.enum(["IA_SUFFIT", "AVOCAT_RECOMMANDE", "ACTE_REGLEMENTE"]);
const requiredProEnum = z.enum(["AVOCAT", "NOTAIRE"]);

export const triageResponseSchema = z.object({
  triage: triageEnum,
  confidence: z.preprocess((value) => {
    const n = Number(value);
    if (Number.isNaN(n)) return value;
    if (n > 1 && n <= 100) return n / 100;
    return n;
  }, z.number().min(0).max(1)),
  domain: z.string().min(1).max(200),
  justification: z.string().min(1).max(2000),
  flags: z.preprocess(
    (value) => (Array.isArray(value) ? value : []),
    z.array(z.string().max(300)).max(20)
  ),
  required_pro: z.preprocess((value) => {
    if (value === undefined || value === "null" || value === "") return null;
    return value;
  }, requiredProEnum.nullable()),
});

export type TriageResponse = z.infer<typeof triageResponseSchema>;

export function parseTriageJson(raw: string): TriageResponse {
  const trimmed = raw.trim();
  const jsonMatch =
    trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, trimmed];
  const candidate = (jsonMatch[1] ?? trimmed).trim();
  const parsed = JSON.parse(candidate) as unknown;
  return triageResponseSchema.parse(parsed);
}

export function isZodParseError(error: unknown): boolean {
  return error instanceof z.ZodError || error instanceof SyntaxError;
}
