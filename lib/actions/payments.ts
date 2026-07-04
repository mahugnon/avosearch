"use server";

import { MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientSession } from "@/lib/auth/client-session";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { notifyMissionPaid } from "@/lib/email/notifications";

export async function payMissionAction(missionId: string): Promise<void> {
  const session = await getClientSession();
  if (!session.ok) return;

  const mission = await prisma.mission.findFirst({
    where: { id: missionId, clientId: session.userId },
  });

  if (!mission) return;
  if (mission.status !== MissionStatus.PROPOSEE) return;

  await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: MissionStatus.ACCEPTEE,
      paidAt: new Date(),
      stripeSessionId: "demo",
    },
  });

  void notifyMissionPaid(missionId);
  const locale = (await getLocale()) as AppLocale;
  redirect(localizedPath(`/app/missions/${missionId}?paid=1`, locale));
}

export async function markMissionPaidFromWebhook(missionId: string, stripeRef?: string) {
  const updated = await prisma.mission.updateMany({
    where: { id: missionId, status: "PROPOSEE" },
    data: {
      status: MissionStatus.ACCEPTEE,
      paidAt: new Date(),
      stripeSessionId: stripeRef ?? undefined,
    },
  });

  if (updated.count > 0) {
    void notifyMissionPaid(missionId);
  }
}
