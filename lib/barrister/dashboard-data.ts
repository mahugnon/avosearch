import { MissionStatus, type MissionType } from "@prisma/client";
import { prisma } from "@/lib/db";

export type WorkQueueItem = {
  id: string;
  contractTitle: string;
  clientName: string;
  status: MissionStatus;
  type: MissionType;
  priceCents: number;
  deadline: Date | null;
  createdAt: Date;
  workStartedAt: Date | null;
};

const ACTION_STATUSES: MissionStatus[] = [
  MissionStatus.ACCEPTEE,
  MissionStatus.EN_COURS,
];

function statusPriority(status: MissionStatus): number {
  if (status === MissionStatus.ACCEPTEE) return 0;
  if (status === MissionStatus.EN_COURS) return 1;
  return 2;
}

function deadlineSortKey(deadline: Date | null): number {
  if (!deadline) return Number.POSITIVE_INFINITY;
  return deadline.getTime();
}

export function sortWorkQueueItems(items: WorkQueueItem[]): WorkQueueItem[] {
  return [...items].sort((a, b) => {
    const statusDiff = statusPriority(a.status) - statusPriority(b.status);
    if (statusDiff !== 0) return statusDiff;

    const deadlineDiff = deadlineSortKey(a.deadline) - deadlineSortKey(b.deadline);
    if (deadlineDiff !== 0) return deadlineDiff;

    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export async function getBarristerWorkQueue(barristerId: string): Promise<WorkQueueItem[]> {
  const missions = await prisma.mission.findMany({
    where: {
      barristerId,
      status: { in: ACTION_STATUSES },
    },
    include: {
      contract: { select: { title: true } },
      client: { select: { name: true } },
    },
  });

  return sortWorkQueueItems(
    missions.map((mission) => ({
      id: mission.id,
      contractTitle: mission.contract.title,
      clientName: mission.client.name,
      status: mission.status,
      type: mission.type,
      priceCents: mission.priceCents,
      deadline: mission.deadline,
      createdAt: mission.createdAt,
      workStartedAt: mission.workStartedAt,
    }))
  );
}

export async function getBarristerActionCount(barristerId: string): Promise<number> {
  return prisma.mission.count({
    where: {
      barristerId,
      status: { in: ACTION_STATUSES },
    },
  });
}

export type BarristerDashboardStats = {
  validationsPending: number;
  inProgress: number;
  earningsCents: number;
};

export async function getBarristerDashboardStats(
  barristerId: string
): Promise<BarristerDashboardStats> {
  const missions = await prisma.mission.findMany({
    where: { barristerId },
    select: { status: true, priceCents: true },
  });

  const validationsPending = missions.filter(
    (m) =>
      m.status === MissionStatus.ACCEPTEE || m.status === MissionStatus.EN_COURS
  ).length;
  const inProgress = missions.filter(
    (m) => m.status === MissionStatus.EN_COURS
  ).length;
  const earningsCents = missions
    .filter(
      (m) =>
        m.status === MissionStatus.TERMINEE || m.status === MissionStatus.LIVREE
    )
    .reduce((sum, m) => sum + m.priceCents, 0);

  return { validationsPending, inProgress, earningsCents };
}

export function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export type DeadlineUrgency = "overdue" | "soon";

export function getDeadlineUrgency(deadline: Date | null): DeadlineUrgency | null {
  if (!deadline) return null;
  const hoursUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 0) return "overdue";
  if (hoursUntil < 24) return "soon";
  return null;
}
