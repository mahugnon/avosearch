import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
});

export const registerClientSchema = z.object({
  name: z.string().min(2, "nameTooShort").max(100),
  email: z.email("invalidEmail"),
  password: z.string().min(8, "passwordTooShort").max(100),
});

export const registerBarristerSchema = registerClientSchema.extend({
  barreau: z.string().min(2, "barreauRequired").max(100),
  city: z.string().min(2, "cityRequired").max(100),
  specialties: z.string().min(2, "specialtyRequired").max(300),
  bio: z.string().min(20, "bioTooShort").max(2000),
  validationPriceCents: z.coerce.number().int().min(1000).max(100000),
  responseTimeHours: z.coerce.number().int().min(1).max(168),
});

export function translateValidationIssue(
  message: string | undefined,
  t: (key: string) => string
): string {
  if (!message) return t("invalidForm");
  const key = message as
    | "nameTooShort"
    | "invalidEmail"
    | "passwordTooShort"
    | "barreauRequired"
    | "cityRequired"
    | "specialtyRequired"
    | "bioTooShort";
  const known = [
    "nameTooShort",
    "invalidEmail",
    "passwordTooShort",
    "barreauRequired",
    "cityRequired",
    "specialtyRequired",
    "bioTooShort",
  ] as const;
  if ((known as readonly string[]).includes(key)) {
    return t(key);
  }
  return t("invalidForm");
}
