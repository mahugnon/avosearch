import { z } from "zod";

export const triageResultSchema = z.enum([
  "IA_SUFFIT",
  "AVOCAT_RECOMMANDE",
  "ACTE_REGLEMENTE",
]);

export const requiredProSchema = z.enum(["AVOCAT", "NOTAIRE"]).nullable();

/** Raw JSON shape returned by the triage model — validated before guardrails. */
export const triageAiResponseSchema = z.object({
  triage: triageResultSchema,
  confidence: z.number().min(0).max(1),
  domain: z.string().min(1).max(200),
  justification: z.string().min(10).max(2000),
  flags: z.array(z.string().min(1).max(300)).max(20),
  required_pro: requiredProSchema,
  in_scope: z.boolean(),
});

export type TriageAiResponse = z.infer<typeof triageAiResponseSchema>;

export const createContractSchema = z.object({
  title: z.string().max(200).optional(),
  userQuestion: z.string().max(5000).optional(),
  pastedText: z.string().max(200_000).optional(),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
