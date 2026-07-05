import { z } from "zod";

export const barristerMatchResponseSchema = z.object({
  rankings: z
    .array(
      z.object({
        barrister_id: z.string().min(1),
        score: z.preprocess((value) => {
          const n = Number(value);
          if (Number.isNaN(n)) return value;
          if (n > 1 && n <= 100) return n / 100;
          return n;
        }, z.number().min(0).max(1)),
        reason: z.string().min(1).max(500),
      })
    )
    .min(1)
    .max(20),
  selected_id: z.string().min(1),
  summary: z.string().min(1).max(500),
});

export type BarristerMatchResponse = z.infer<typeof barristerMatchResponseSchema>;

export function parseBarristerMatchJson(raw: string): BarristerMatchResponse {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, trimmed];
  const candidate = (jsonMatch[1] ?? trimmed).trim();
  return barristerMatchResponseSchema.parse(JSON.parse(candidate));
}

export function isBarristerMatchParseError(error: unknown): boolean {
  return error instanceof z.ZodError || error instanceof SyntaxError;
}
