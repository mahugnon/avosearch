import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const BARRISTER_DELIVERED_STATUSES: MissionStatus[] = [
  MissionStatus.LIVREE,
  MissionStatus.TERMINEE,
];

export type ContractReviewBarrister = {
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

function toReviewBarrister(barrister: {
  id: string;
  name: string;
  barristerProfile: {
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
}): ContractReviewBarrister | null {
  if (!barrister.barristerProfile) return null;
  const profile = barrister.barristerProfile;
  return {
    userId: barrister.id,
    name: barrister.name,
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

export function isBarristerReviewDelivered(status: MissionStatus): boolean {
  return BARRISTER_DELIVERED_STATUSES.includes(status);
}

export async function getReviewBarristersByContractIds(
  contractIds: string[]
): Promise<Map<string, ContractReviewBarrister>> {
  if (contractIds.length === 0) return new Map();

  const missions = await prisma.mission.findMany({
    where: {
      contractId: { in: contractIds },
      status: { in: BARRISTER_DELIVERED_STATUSES },
    },
    orderBy: { deliveredAt: "desc" },
    include: {
      barrister: { include: { barristerProfile: true } },
    },
  });

  const map = new Map<string, ContractReviewBarrister>();
  for (const mission of missions) {
    if (map.has(mission.contractId) || !mission.barrister) continue;
    const barrister = toReviewBarrister(mission.barrister);
    if (barrister) map.set(mission.contractId, barrister);
  }
  return map;
}

export async function getBarristerReviewedContractIds(
  contractIds: string[]
): Promise<Set<string>> {
  const map = await getReviewBarristersByContractIds(contractIds);
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
      status: { in: BARRISTER_DELIVERED_STATUSES },
    },
    orderBy: { deliveredAt: "desc" },
    select: {
      id: true,
      status: true,
      globalNote: true,
      deliveredAt: true,
      barrister: { include: { barristerProfile: true } },
    },
  });
}

export async function getReviewBarristerForContract(
  contractId: string,
  clientId: string
): Promise<ContractReviewBarrister | null> {
  const mission = await getClientDeliveredMissionForContract(contractId, clientId);
  if (!mission?.barrister) return null;
  return toReviewBarrister(mission.barrister);
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
