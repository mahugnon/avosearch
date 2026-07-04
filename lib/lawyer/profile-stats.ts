import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const EARNED_STATUSES: MissionStatus[] = [
  MissionStatus.LIVREE,
  MissionStatus.TERMINEE,
];

export type LawyerProfileStats = {
  earningsCents: number;
  deliveredCount: number;
  inProgressCount: number;
  awaitingClientCount: number;
};

function missionAmountCents(mission: {
  priceCents: number;
  finalPriceCents: number | null;
}): number {
  return mission.finalPriceCents ?? mission.priceCents;
}

export async function getLawyerProfileStats(
  lawyerId: string
): Promise<LawyerProfileStats> {
  const missions = await prisma.mission.findMany({
    where: { lawyerId },
    select: {
      status: true,
      priceCents: true,
      finalPriceCents: true,
    },
  });

  let earningsCents = 0;
  let deliveredCount = 0;
  let inProgressCount = 0;
  let awaitingClientCount = 0;

  for (const mission of missions) {
    if (EARNED_STATUSES.includes(mission.status)) {
      earningsCents += missionAmountCents(mission);
      deliveredCount += 1;
    }
    if (mission.status === MissionStatus.LIVREE) {
      awaitingClientCount += 1;
    }
    if (
      mission.status === MissionStatus.ACCEPTEE ||
      mission.status === MissionStatus.EN_COURS
    ) {
      inProgressCount += 1;
    }
  }

  return {
    earningsCents,
    deliveredCount,
    inProgressCount,
    awaitingClientCount,
  };
}
