"use server";

import { ModStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth/client-session";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/auth/roles";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function recordAiConsentAction(contractId: string) {
  const session = await getClientSession();
  if (!session.ok) return { error: session.reason };

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, ownerId: session.userId },
  });
  if (!contract) return { error: "not_found" };

  await prisma.contract.update({
    where: { id: contractId },
    data: { aiConsentAt: new Date() },
  });

  return { ok: true as const };
}

export async function runReviewAction(_contractId: string) {
  const session = await auth();
  if (!session || isAdmin(session.user.role) || session.user.role !== "LAWYER") {
    return { error: "unauthorized" };
  }
  return { error: "use_api" };
}

export async function updateModificationStatusAction(
  modificationId: string,
  status: "ACCEPTEE_CLIENT" | "REJETEE_CLIENT"
) {
  const session = await getClientSession();
  if (!session.ok) return { error: session.reason };

  const mod = await prisma.modification.findUnique({
    where: { id: modificationId },
    include: { analysis: { include: { contract: true } } },
  });

  if (!mod || mod.analysis.contract.ownerId !== session.userId) {
    return { error: "not_found" };
  }

  await prisma.modification.update({
    where: { id: modificationId },
    data: { status: status as ModStatus },
  });

  return { ok: true as const };
}

export async function startReviewFlowAction(contractId: string, _plan: "ai-only" | "ai-lawyer") {
  const locale = (await getLocale()) as AppLocale;
  redirect(localizedPath(`/app/contracts/${contractId}`, locale));
}
