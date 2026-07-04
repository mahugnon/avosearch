import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
});

export const registerClientSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  email: z.email("Adresse e-mail invalide"),
  password: z.string().min(8, "8 caractères minimum").max(100),
});

export const registerLawyerSchema = registerClientSchema.extend({
  barreau: z.string().min(2, "Barreau requis").max(100),
  city: z.string().min(2, "Ville requise").max(100),
  // Comma-separated list in the form, split server-side
  specialties: z.string().min(2, "Au moins une spécialité").max(300),
  bio: z.string().min(20, "Présentez votre pratique en quelques phrases").max(2000),
  validationPriceCents: z.coerce.number().int().min(1000).max(100000),
  responseTimeHours: z.coerce.number().int().min(1).max(168),
});
