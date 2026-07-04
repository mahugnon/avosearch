import { z } from "zod";

export const draftStartResponseSchema = z.object({
  is_draft_intent: z.boolean(),
  template_slug: z.string().min(1).max(80).nullable(),
  assistant_message: z.string().min(1).max(2000),
});

export const draftTurnResponseSchema = z.object({
  collected: z
    .record(z.string(), z.string())
    .optional()
    .default({}),
  assistant_message: z.string().min(1).max(2000),
  complete: z.boolean().default(false),
});

export type DraftStartResponse = z.infer<typeof draftStartResponseSchema>;
export type DraftTurnResponse = z.infer<typeof draftTurnResponseSchema>;

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/) ?? [null, trimmed];
  const candidate = (jsonMatch[1] ?? trimmed).trim();
  return JSON.parse(candidate);
}

export function parseDraftStartJson(raw: string): DraftStartResponse {
  return draftStartResponseSchema.parse(extractJson(raw));
}

export function parseDraftTurnJson(raw: string): DraftTurnResponse {
  return draftTurnResponseSchema.parse(extractJson(raw));
}

export const draftFollowUpResponseSchema = z.object({
  assistant_message: z.string().min(1).max(3000),
  updated_body: z.string().max(120_000).optional(),
});

export type DraftFollowUpResponse = z.infer<typeof draftFollowUpResponseSchema>;

export function parseDraftFollowUpJson(raw: string): DraftFollowUpResponse {
  return draftFollowUpResponseSchema.parse(extractJson(raw));
}

export function isDraftChatParseError(error: unknown): boolean {
  return error instanceof z.ZodError || error instanceof SyntaxError;
}
