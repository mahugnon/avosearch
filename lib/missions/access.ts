import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function findBarristerMissionForContract(contractId: string, barristerUserId: string) {
  return prisma.mission.findFirst({
    where: {
      contractId,
      barristerId: barristerUserId,
      status: { in: [MissionStatus.ACCEPTEE, MissionStatus.EN_COURS, MissionStatus.LIVREE] },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findBarristerMissionById(missionId: string, barristerUserId: string) {
  return prisma.mission.findFirst({
    where: { id: missionId, barristerId: barristerUserId },
    include: {
      contract: {
        include: {
          analysis: { include: { modifications: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });
}
