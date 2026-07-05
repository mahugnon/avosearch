import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const LAWYER_DELIVERED_STATUSES: MissionStatus[] = [
  MissionStatus.LIVREE,
  MissionStatus.TERMINEE,
];

export type ContractReviewLawyer = {
  userId: string;
  name: string;
  photoUrl: string | null;
  barreau: string;
  city: string;
  specialties: string[];
  bio: string;
  validationPriceCents: number;
  responseTimeHours: number;
  rating: number | null;
  ratingCount: number;
};

function toReviewLawyer(lawyer: {
  id: string;
  name: string;
  lawyerProfile: {
    photoUrl: string | null;
    barreau: string;
    city: string;
    specialties: string[];
    bio: string;
    validationPriceCents: number;
    responseTimeHours: number;
    rating: number | null;
    ratingCount: number;
  } | null;
}): ContractReviewLawyer | null {
  if (!lawyer.lawyerProfile) return null;
  const profile = lawyer.lawyerProfile;
  return {
    userId: lawyer.id,
    name: lawyer.name,
    photoUrl: profile.photoUrl,
    barreau: profile.barreau,
    city: profile.city,
    specialties: profile.specialties,
    bio: profile.bio,
    validationPriceCents: profile.validationPriceCents,
    responseTimeHours: profile.responseTimeHours,
    rating: profile.rating,
    ratingCount: profile.ratingCount,
  };
}

export function isLawyerReviewDelivered(status: MissionStatus): boolean {
  return LAWYER_DELIVERED_STATUSES.includes(status);
}

export async function getReviewLawyersByContractIds(
  contractIds: string[]
): Promise<Map<string, ContractReviewLawyer>> {
  if (contractIds.length === 0) return new Map();

  const missions = await prisma.mission.findMany({
    where: {
      contractId: { in: contractIds },
      status: { in: LAWYER_DELIVERED_STATUSES },
    },
    orderBy: { deliveredAt: "desc" },
    include: {
      lawyer: { include: { lawyerProfile: true } },
    },
  });

  const map = new Map<string, ContractReviewLawyer>();
  for (const mission of missions) {
    if (map.has(mission.contractId) || !mission.lawyer) continue;
    const lawyer = toReviewLawyer(mission.lawyer);
    if (lawyer) map.set(mission.contractId, lawyer);
  }
  return map;
}

export async function getLawyerReviewedContractIds(
  contractIds: string[]
): Promise<Set<string>> {
  const map = await getReviewLawyersByContractIds(contractIds);
  return new Set(map.keys());
}

export async function getClientDeliveredMissionForContract(
  contractId: string,
  clientId: string
) {
  return prisma.mission.findFirst({
    where: {
      contractId,
      clientId,
      status: { in: LAWYER_DELIVERED_STATUSES },
    },
    orderBy: { deliveredAt: "desc" },
    select: {
      id: true,
      status: true,
      globalNote: true,
      deliveredAt: true,
      lawyer: { include: { lawyerProfile: true } },
    },
  });
}

export async function getReviewLawyerForContract(
  contractId: string,
  clientId: string
): Promise<ContractReviewLawyer | null> {
  const mission = await getClientDeliveredMissionForContract(contractId, clientId);
  if (!mission?.lawyer) return null;
  return toReviewLawyer(mission.lawyer);
}

export async function getActiveMissionContractIds(
  contractIds: string[],
  clientId: string
): Promise<Set<string>> {
  if (contractIds.length === 0) return new Set();

  const missions = await prisma.mission.findMany({
    where: {
      contractId: { in: contractIds },
      clientId,
      status: {
        in: [MissionStatus.PROPOSEE, MissionStatus.ACCEPTEE, MissionStatus.EN_COURS],
      },
    },
    select: { contractId: true },
  });

  return new Set(missions.map((m) => m.contractId));
}
