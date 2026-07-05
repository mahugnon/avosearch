"use server";

import { MissionStatus, MissionType, type ModStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth/client-session";
import { missionPriceForType } from "@/lib/matching/lawyers";
import { priceForValidationMission, toLawyerMatchView } from "@/lib/matching/lawyer-view";
import { rankLawyersForContract } from "@/lib/matching/select-lawyer";
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

export async function getLawyerSelectionAction(contractId: string) {
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

  const ranked = await rankLawyersForContract(contractId, 5);
  if (ranked.length === 0) return { error: "no_lawyers" as const };

  const lawyers = ranked.map(toLawyerMatchView);
  const selectedLawyerId = lawyers[0]!.userId;
  const priceCents = priceForValidationMission(ranked[0]!.profile);

  return {
    ok: true as const,
    lawyers,
    selectedLawyerId,
    priceCents,
  };
}

export async function confirmLawyerMissionAction(contractId: string, lawyerUserId: string): Promise<void> {
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

  const lawyer = await prisma.lawyerProfile.findFirst({
    where: { userId: lawyerUserId, verified: true, available: true },
  });
  if (!lawyer) {
    redirect(localizedPath(`/app/contracts/${contractId}`, locale));
  }

  const ranked = await rankLawyersForContract(contractId, 5);
  const match = ranked.find((r) => r.profile.userId === lawyerUserId);
  const flatFees = (lawyer.flatFees ?? {}) as Record<string, number>;
  const priceCents = missionPriceForType(MissionType.VALIDATION, lawyer.validationPriceCents, flatFees);

  const mission = await prisma.mission.create({
    data: {
      type: MissionType.VALIDATION,
      contractId,
      clientId: session.userId,
      lawyerId: lawyer.userId,
      priceCents,
      status: MissionStatus.ACCEPTEE,
      paidAt: new Date(),
      stripeSessionId: "demo",
      deadline: new Date(Date.now() + lawyer.responseTimeHours * 3600_000),
      autoAssigned: true,
      selectionScore: match?.breakdown.total ?? null,
    },
  });

  void notifyMissionCreated(mission.id);
  void notifyMissionPaid(mission.id);
  redirect(localizedPath(`/app/orders?paid=${mission.id}`, locale));
}

export async function requestLawyerOpinionAction(contractId: string): Promise<void> {
  const session = await getClientSession();
  const locale = (await getLocale()) as AppLocale;
  if (!session.ok) {
    redirect(localizedPath("/login", locale));
  }

  const selection = await getLawyerSelectionAction(contractId);

  if ("existingMissionId" in selection && selection.existingMissionId) {
    redirect(localizedPath(`/app/missions/${selection.existingMissionId}`, locale));
  }

  if ("error" in selection || !("ok" in selection) || !selection.ok) {
    redirect(localizedPath(`/app/contracts/${contractId}`, locale));
  }

  await confirmLawyerMissionAction(contractId, selection.selectedLawyerId);
}

export async function createMissionAction(input: {
  contractId: string;
  lawyerUserId: string;
  type: MissionType;
  plan?: "ai-lawyer" | "mission";
}) {
  const session = await getClientSession();
  if (!session.ok) return { error: session.reason };

  const contract = await prisma.contract.findFirst({
    where: { id: input.contractId, ownerId: session.userId },
    select: { id: true, extractedText: true, userQuestion: true },
  });
  if (!contract || !contractMatchingContext(contract)) return { error: "empty_contract" };

  const lawyer = await prisma.lawyerProfile.findFirst({
    where: { userId: input.lawyerUserId, verified: true, available: true },
  });
  if (!lawyer) return { error: "lawyer_unavailable" };

  const flatFees = (lawyer.flatFees ?? {}) as Record<string, number>;
  let priceCents = missionPriceForType(input.type, lawyer.validationPriceCents, flatFees);

  if (input.plan === "ai-lawyer" && input.type === MissionType.VALIDATION) {
    priceCents = pricing.aiPlusLawyerCents;
  }

  const mission = await prisma.mission.create({
    data: {
      type: input.type,
      contractId: contract.id,
      clientId: session.userId,
      lawyerId: lawyer.userId,
      priceCents,
      status: MissionStatus.PROPOSEE,
      deadline: new Date(Date.now() + lawyer.responseTimeHours * 3600_000),
    },
  });

  void notifyMissionCreated(mission.id);

  return { ok: true as const, missionId: mission.id };
}

export async function lawyerAcceptMissionAction(missionId: string) {
  const session = await auth();
  if (!session || session.user.role !== "LAWYER") return { error: "unauthorized" };

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, lawyerId: session.user.id },
    include: { lawyer: { include: { lawyerProfile: true } } },
  });
  if (!mission) return { error: "not_found" };

  const hourlyRate = mission.lawyer?.lawyerProfile?.hourlyRateCents ?? 15000;

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

export async function lawyerValidateModificationAction(input: {
  modificationId: string;
  action: "VALIDEE_AVOCAT" | "REJETEE_AVOCAT" | "AMENDEE_AVOCAT";
  amendedText?: string;
  lawyerComment?: string;
}) {
  const session = await auth();
  if (!session || session.user.role !== "LAWYER") return { error: "unauthorized" };

  const mod = await prisma.modification.findUnique({
    where: { id: input.modificationId },
    include: {
      analysis: {
        include: {
          contract: { include: { missions: { where: { lawyerId: session.user.id } } } },
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
      lawyerComment: input.lawyerComment ?? null,
    },
  });

  return { ok: true as const };
}

export async function deliverMissionAction(missionId: string, globalNote: string) {
  const session = await auth();
  if (!session || session.user.role !== "LAWYER") return { error: "unauthorized" };

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, lawyerId: session.user.id },
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
