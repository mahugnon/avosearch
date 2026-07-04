"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { registerClientSchema, registerLawyerSchema } from "@/lib/validation/auth";

export type AuthActionState = { error?: string } | undefined;

const ROLE_HOME = {
  CLIENT: "/app",
  LAWYER: "/lawyer",
  ADMIN: "/admin",
} as const;

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  // Resolve the landing area up front: redirecting to another role's home
  // would bounce through the proxy and desync the URL after a server action.
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });

  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: ROLE_HOME[user?.role ?? "CLIENT"],
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou mot de passe incorrect." };
    }
    // Successful sign-in throws a NEXT_REDIRECT: let it bubble
    throw error;
  }
  return undefined;
}

export async function registerClientAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse e-mail." };
  }

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "CLIENT",
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/app",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Compte créé, mais la connexion a échoué. Connectez-vous manuellement." };
    }
    throw error;
  }
  return undefined;
}

export async function registerLawyerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerLawyerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    barreau: formData.get("barreau"),
    city: formData.get("city"),
    specialties: formData.get("specialties"),
    bio: formData.get("bio"),
    validationPriceCents: formData.get("validationPriceCents"),
    responseTimeHours: formData.get("responseTimeHours"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse e-mail." };
  }

  const specialties = parsed.data.specialties
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "LAWYER",
      lawyerProfile: {
        create: {
          barreau: parsed.data.barreau,
          city: parsed.data.city,
          specialties,
          bio: parsed.data.bio,
          validationPriceCents: parsed.data.validationPriceCents,
          flatFees: {},
          responseTimeHours: parsed.data.responseTimeHours,
          verified: false,
        },
      },
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo: "/lawyer",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Compte créé, mais la connexion a échoué. Connectez-vous manuellement." };
    }
    throw error;
  }
  return undefined;
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
