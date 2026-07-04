import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function findLawyerMissionForContract(contractId: string, lawyerUserId: string) {
  return prisma.mission.findFirst({
    where: {
      contractId,
      lawyerId: lawyerUserId,
      status: { in: [MissionStatus.ACCEPTEE, MissionStatus.EN_COURS, MissionStatus.LIVREE] },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findLawyerMissionById(missionId: string, lawyerUserId: string) {
  return prisma.mission.findFirst({
    where: { id: missionId, lawyerId: lawyerUserId },
    include: {
      contract: {
        include: {
          analysis: { include: { modifications: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });
}
