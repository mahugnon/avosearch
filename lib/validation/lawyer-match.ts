import { z } from "zod";

export const lawyerMatchResponseSchema = z.object({
  rankings: z
    .array(
      z.object({
        lawyer_id: z.string().min(1),
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

export type LawyerMatchResponse = z.infer<typeof lawyerMatchResponseSchema>;

export function parseLawyerMatchJson(raw: string): LawyerMatchResponse {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, trimmed];
  const candidate = (jsonMatch[1] ?? trimmed).trim();
  return lawyerMatchResponseSchema.parse(JSON.parse(candidate));
}

export function isLawyerMatchParseError(error: unknown): boolean {
  return error instanceof z.ZodError || error instanceof SyntaxError;
}
