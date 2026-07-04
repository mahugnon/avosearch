import { z } from "zod";

export const reviewModificationSchema = z.object({
  order: z.number().int().positive(),
  original_excerpt: z.string().min(1).max(2000),
  proposed_text: z.string().min(1).max(2000),
  rationale: z.string().min(1).max(1000),
  risk_level: z.enum(["FAIBLE", "MOYEN", "ELEVE"]),
});

export const reviewResponseSchema = z.object({
  modifications: z.array(reviewModificationSchema).min(1).max(15),
});

export type ReviewModification = z.infer<typeof reviewModificationSchema>;
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

export function parseReviewJson(raw: string): ReviewResponse {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch?.[0] ?? trimmed) as unknown;
  return reviewResponseSchema.parse(parsed);
}

export function isZodReviewParseError(error: unknown): boolean {
  return error instanceof z.ZodError;
}
