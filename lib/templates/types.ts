import { z } from "zod";

export const templateFieldSchema = z.object({
  id: z.string().min(1).max(50),
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  placeholder: z.string().max(200).optional(),
  chatPrompt: z.string().max(500).optional(),
  type: z.enum(["text", "textarea", "email", "date", "number"]).default("text"),
  required: z.boolean().default(true),
});

export const templateStepSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  fields: z.array(templateFieldSchema).min(1),
});

export const templateStepsSchema = z.array(templateStepSchema).min(1);

export type TemplateField = z.infer<typeof templateFieldSchema>;
export type TemplateStep = z.infer<typeof templateStepSchema>;

export function parseTemplateSteps(steps: unknown): TemplateStep[] {
  return templateStepsSchema.parse(steps);
}

export function flattenTemplateFields(steps: TemplateStep[]): TemplateField[] {
  return steps.flatMap((step) => step.fields);
}
