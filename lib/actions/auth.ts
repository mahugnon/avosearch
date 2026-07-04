"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import {
  registerClientSchema,
  registerLawyerSchema,
  translateValidationIssue,
} from "@/lib/validation/auth";
import { localizedPath, type AppLocale } from "@/lib/i18n";

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
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("errors");
  const email = String(formData.get("email") ?? "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });

  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: localizedPath(ROLE_HOME[user?.role ?? "CLIENT"], locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: t("invalidCredentials") };
    }
    throw error;
  }
  return undefined;
}

export async function registerClientAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const locale = (await getLocale()) as AppLocale;
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("validation");

  const parsed = registerClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      error: translateValidationIssue(parsed.error.issues[0]?.message, tValidation),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: tErrors("emailExists") };
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
      redirectTo: localizedPath("/app", locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: tErrors("signInAfterRegister") };
    }
    throw error;
  }
  return undefined;
}

export async function registerLawyerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const locale = (await getLocale()) as AppLocale;
  const tErrors = await getTranslations("errors");
  const tValidation = await getTranslations("validation");

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
    return {
      error: translateValidationIssue(parsed.error.issues[0]?.message, tValidation),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: tErrors("emailExists") };
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
      redirectTo: localizedPath("/lawyer", locale),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: tErrors("signInAfterRegister") };
    }
    throw error;
  }
  return undefined;
}

export async function signOutAction(): Promise<void> {
  const locale = (await getLocale()) as AppLocale;
  await signOut({ redirectTo: localizedPath("/", locale) });
}
