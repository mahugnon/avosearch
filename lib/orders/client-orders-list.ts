import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isBarristerReviewDelivered } from "@/lib/contracts/barrister-review";

export type ClientOrderRow = {
  id: string;
  title: string;
  createdAt: Date;
  paidAt: Date | null;
  deliveredAt: Date | null;
  status: MissionStatus;
  priceCents: number;
  finalPriceCents: number | null;
  barristerName: string | null;
  contractId: string;
  hasDeliveredDocument: boolean;
};

export async function listClientOrders(clientId: string): Promise<ClientOrderRow[]> {
  const missions = await prisma.mission.findMany({
    where: {
      clientId,
      status: { not: MissionStatus.ANNULEE },
    },
    orderBy: { createdAt: "desc" },
    include: {
      contract: { select: { id: true, title: true, extractedText: true, userQuestion: true } },
      barrister: { select: { name: true } },
    },
  });

  return missions.map((mission) => ({
    id: mission.id,
    title: mission.contract.title || mission.contract.userQuestion || "—",
    createdAt: mission.createdAt,
    paidAt: mission.paidAt,
    deliveredAt: mission.deliveredAt,
    status: mission.status,
    priceCents: mission.priceCents,
    finalPriceCents: mission.finalPriceCents,
    barristerName: mission.barrister?.name ?? null,
    contractId: mission.contractId,
    hasDeliveredDocument:
      isBarristerReviewDelivered(mission.status) && mission.contract.extractedText.trim().length > 0,
  }));
}
