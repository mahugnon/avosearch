import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const templateMetadataSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(slugPattern, "invalid_slug"),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  domain: z.string().trim().min(2).max(120),
  tags: z.array(z.string().trim().min(1).max(50)).min(1).max(20),
  draftGuide: z.string().trim().max(4000).optional(),
  active: z.boolean().default(true),
});

export type TemplateMetadataInput = z.infer<typeof templateMetadataSchema>;

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
