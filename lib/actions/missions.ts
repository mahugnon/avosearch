"use server";

import { MissionStatus, MissionType, type ModStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth/client-session";
import { missionPriceForType } from "@/lib/matching/barristers";
import { priceForValidationMission, toBarristerMatchView } from "@/lib/matching/barrister-view";
import { rankBarristersForContract } from "@/lib/matching/select-barrister";
import { computeTimedPriceCents, elapsedWorkSeconds } from "@/lib/matching/billing";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { pricing } from "@/lib/config";
import { auth } from "@/lib/auth";
import { notifyMissionDelivered, notifyMissionCreated, notifyMissionPaid } from "@/lib/email/notifications";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { contractMatchingContext } from "@/lib/contracts/document";

async function requireOwnedContract(contractId: string, ownerId: string) {
  const contract = await prisma.contract.findFirst({
    where: { id: contractId, ownerId },
    select: { id: true, extractedText: true, userQuestion: true },
  });
  if (!contract || !contractMatchingContext(contract)) {
    return { error: "empty_contract" as const };
  }
  return { contract };
}

export async function getBarristerSelectionAction(contractId: string) {
  const session = await getClientSession();
  if (!session.ok) return { error: session.reason as string };

  const existing = await prisma.mission.findFirst({
    where: {
      contractId,
      clientId: session.userId,
      status: { notIn: [MissionStatus.ANNULEE, MissionStatus.TERMINEE] },
    },
    select: { id: true },
  });
  if (existing) {
    return { existingMissionId: existing.id };
  }

  const owned = await requireOwnedContract(contractId, session.userId);
  if ("error" in owned) return { error: owned.error };

  const ranked = await rankBarristersForContract(contractId, 5);
  if (ranked.length === 0) return { error: "no_barristers" as const };

  const barristers = ranked.map(toBarristerMatchView);
  const selectedBarristerId = barristers[0]!.userId;
  const priceCents = priceForValidationMission(ranked[0]!.profile);

  return {
    ok: true as const,
    barristers,
    selectedBarristerId,
    priceCents,
  };
}

export async function confirmBarristerMissionAction(contractId: string, barristerUserId: string): Promise<void> {
  const session = await getClientSession();
  const locale = (await getLocale()) as AppLocale;
  if (!session.ok) {
    redirect(localizedPath("/login", locale));
  }

  const existing = await prisma.mission.findFirst({
    where: {
      contractId,
      clientId: session.userId,
      status: { notIn: [MissionStatus.ANNULEE, MissionStatus.TERMINEE] },
    },
    select: { id: true },
  });
  if (existing) {
    redirect(localizedPath(`/app/missions/${existing.id}`, locale));
  }

  const owned = await requireOwnedContract(contractId, session.userId);
  if ("error" in owned) {
    redirect(localizedPath(`/app/contracts/${contractId}`, locale));
  }

  const barrister = await prisma.barristerProfile.findFirst({
    where: { userId: barristerUserId, verified: true, available: true },
  });
  if (!barrister) {
    redirect(localizedPath(`/app/contracts/${contractId}`, locale));
  }

  const ranked = await rankBarristersForContract(contractId, 5);
  const match = ranked.find((r) => r.profile.userId === barristerUserId);
  const flatFees = (barrister.flatFees ?? {}) as Record<string, number>;
  const priceCents = missionPriceForType(MissionType.VALIDATION, barrister.validationPriceCents, flatFees);

  const mission = await prisma.mission.create({
    data: {
      type: MissionType.VALIDATION,
      contractId,
      clientId: session.userId,
      barristerId: barrister.userId,
      priceCents,
      status: MissionStatus.ACCEPTEE,
      paidAt: new Date(),
      stripeSessionId: "demo",
      deadline: new Date(Date.now() + barrister.responseTimeHours * 3600_000),
      autoAssigned: true,
      selectionScore: match?.breakdown.total ?? null,
    },
  });

  void notifyMissionCreated(mission.id);
  void notifyMissionPaid(mission.id);
  redirect(localizedPath(`/app/orders?paid=${mission.id}`, locale));
}

export async function requestBarristerOpinionAction(contractId: string): Promise<void> {
  const session = await getClientSession();
  const locale = (await getLocale()) as AppLocale;
  if (!session.ok) {
    redirect(localizedPath("/login", locale));
  }

  const selection = await getBarristerSelectionAction(contractId);

  if ("existingMissionId" in selection && selection.existingMissionId) {
    redirect(localizedPath(`/app/missions/${selection.existingMissionId}`, locale));
  }

  if ("error" in selection || !("ok" in selection) || !selection.ok) {
    redirect(localizedPath(`/app/contracts/${contractId}`, locale));
  }

  await confirmBarristerMissionAction(contractId, selection.selectedBarristerId);
}

export async function createMissionAction(input: {
  contractId: string;
  barristerUserId: string;
  type: MissionType;
  plan?: "ai-barrister" | "mission";
}) {
  const session = await getClientSession();
  if (!session.ok) return { error: session.reason };

  const contract = await prisma.contract.findFirst({
    where: { id: input.contractId, ownerId: session.userId },
    select: { id: true, extractedText: true, userQuestion: true },
  });
  if (!contract || !contractMatchingContext(contract)) return { error: "empty_contract" };

  const barrister = await prisma.barristerProfile.findFirst({
    where: { userId: input.barristerUserId, verified: true, available: true },
  });
  if (!barrister) return { error: "barrister_unavailable" };

  const flatFees = (barrister.flatFees ?? {}) as Record<string, number>;
  let priceCents = missionPriceForType(input.type, barrister.validationPriceCents, flatFees);

  if (input.plan === "ai-barrister" && input.type === MissionType.VALIDATION) {
    priceCents = pricing.aiPlusBarristerCents;
  }

  const mission = await prisma.mission.create({
    data: {
      type: input.type,
      contractId: contract.id,
      clientId: session.userId,
      barristerId: barrister.userId,
      priceCents,
      status: MissionStatus.PROPOSEE,
      deadline: new Date(Date.now() + barrister.responseTimeHours * 3600_000),
    },
  });

  void notifyMissionCreated(mission.id);

  return { ok: true as const, missionId: mission.id };
}

export async function barristerAcceptMissionAction(missionId: string) {
  const session = await auth();
  if (!session || session.user.role !== "BARRISTER") return { error: "unauthorized" };

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, barristerId: session.user.id },
    include: { barrister: { include: { barristerProfile: true } } },
  });
  if (!mission) return { error: "not_found" };

  const hourlyRate = mission.barrister?.barristerProfile?.hourlyRateCents ?? 15000;

  await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.EN_COURS,
      workStartedAt: new Date(),
      hourlyRateCents: hourlyRate,
    },
  });

  return { ok: true as const };
}

export async function barristerValidateModificationAction(input: {
  modificationId: string;
  action: "VALIDEE_AVOCAT" | "REJETEE_AVOCAT" | "AMENDEE_AVOCAT";
  amendedText?: string;
  barristerComment?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "BARRISTER") return { error: "unauthorized" };

  const mod = await prisma.modification.findUnique({
    where: { id: input.modificationId },
    include: {
      analysis: {
        include: {
          contract: { include: { missions: { where: { barristerId: session.user.id } } } },
        },
      },
    },
  });

  if (!mod || mod.analysis.contract.missions.length === 0) {
    return { error: "not_found" };
  }

  await prisma.modification.update({
    where: { id: input.modificationId },
    data: {
      status: input.action as ModStatus,
      amendedText: input.amendedText ?? null,
      barristerComment: input.barristerComment ?? null,
    },
  });

  return { ok: true as const };
}

export async function deliverMissionAction(missionId: string, globalNote: string) {
  const session = await auth();
  if (!session || session.user.role !== "BARRISTER") return { error: "unauthorized" };

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, barristerId: session.user.id },
  });
  if (!mission) return { error: "not_found" };

  const durationSeconds = elapsedWorkSeconds(mission.workStartedAt, mission.workDurationSeconds);
  const hourlyRate = mission.hourlyRateCents ?? 15000;
  const finalPriceCents = computeTimedPriceCents(durationSeconds, hourlyRate, mission.priceCents);

  await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.LIVREE,
      deliveredAt: new Date(),
      globalNote,
      validatedAt: new Date(),
      workDurationSeconds: durationSeconds,
      workStartedAt: null,
      finalPriceCents,
    },
  });

  void notifyMissionDelivered(missionId);

  return { ok: true as const, finalPriceCents, durationSeconds };
}

export async function completeMissionAction(missionId: string) {
  const session = await getClientSession();
  if (!session.ok) return { error: session.reason };

  await prisma.mission.updateMany({
    where: { id: missionId, clientId: session.userId, status: MissionStatus.LIVREE },
    data: { status: MissionStatus.TERMINEE },
  });

  return { ok: true as const };
}

export async function goToMissionAction(missionId: string) {
  const locale = (await getLocale()) as AppLocale;
  redirect(localizedPath(`/app/missions/${missionId}`, locale));
}
