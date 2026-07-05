import { MissionStatus, type MissionType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type MissionStatusFilter =
  | MissionStatus
  | "all"
  | "active"
  | "done";

export type MissionSortKey =
  | "createdAt:desc"
  | "createdAt:asc"
  | "deadline:asc"
  | "deadline:desc"
  | "price:desc"
  | "price:asc"
  | "status:asc";

export type MissionListView = "board" | "table";

export type MissionListFilters = {
  q: string;
  status: MissionStatusFilter;
  sort: MissionSortKey;
  view: MissionListView;
};

export type MissionListRow = {
  id: string;
  contractTitle: string;
  clientName: string;
  type: MissionType;
  status: MissionStatus;
  priceCents: number;
  createdAt: Date;
  deadline: Date | null;
};

const SORT_KEYS: MissionSortKey[] = [
  "createdAt:desc",
  "createdAt:asc",
  "deadline:asc",
  "deadline:desc",
  "price:desc",
  "price:asc",
  "status:asc",
];

const STATUS_FILTERS: MissionStatusFilter[] = [
  "active",
  "all",
  MissionStatus.ACCEPTEE,
  MissionStatus.EN_COURS,
  "done",
  MissionStatus.ANNULEE,
];

const ACTIVE_STATUSES: MissionStatus[] = [
  MissionStatus.ACCEPTEE,
  MissionStatus.EN_COURS,
];

function statusPriority(status: MissionStatus): number {
  const order: MissionStatus[] = [
    MissionStatus.ACCEPTEE,
    MissionStatus.EN_COURS,
    MissionStatus.PROPOSEE,
    MissionStatus.LIVREE,
    MissionStatus.TERMINEE,
    MissionStatus.ANNULEE,
  ];
  const index = order.indexOf(status);
  return index === -1 ? order.length : index;
}

function sortMissions(rows: MissionListRow[], sort: MissionSortKey): MissionListRow[] {
  const [field, dir] = sort.split(":") as [string, "asc" | "desc"];
  const multiplier = dir === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (field === "createdAt") {
      return (a.createdAt.getTime() - b.createdAt.getTime()) * multiplier;
    }
    if (field === "price") {
      return (a.priceCents - b.priceCents) * multiplier;
    }
    if (field === "deadline") {
      const aKey = a.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
      const bKey = b.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
      return (aKey - bKey) * multiplier;
    }
    if (field === "status") {
      return statusPriority(a.status) - statusPriority(b.status);
    }
    return 0;
  });
}

export function parseMissionListFilters(
  params: Record<string, string | string[] | undefined>
): MissionListFilters {
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const rawStatus = typeof params.status === "string" ? params.status : "active";
  let status: MissionStatusFilter = "active";
  if (STATUS_FILTERS.includes(rawStatus as MissionStatusFilter)) {
    status = rawStatus as MissionStatusFilter;
  } else if (
    rawStatus === MissionStatus.LIVREE ||
    rawStatus === MissionStatus.TERMINEE
  ) {
    status = "done";
  }
  const rawSort = typeof params.sort === "string" ? params.sort : "createdAt:desc";
  const sort = SORT_KEYS.includes(rawSort as MissionSortKey)
    ? (rawSort as MissionSortKey)
    : "createdAt:desc";
  const rawView = typeof params.view === "string" ? params.view : "table";
  const view: MissionListView = rawView === "board" ? "board" : "table";

  return { q, status, sort, view };
}

export async function getBarristerMissionsList(
  barristerId: string,
  filters: MissionListFilters
): Promise<MissionListRow[]> {
  const where: Prisma.MissionWhereInput = { barristerId };

  if (filters.status === "active") {
    where.status = { in: ACTIVE_STATUSES };
  } else if (filters.status === "done") {
    where.status = { in: [MissionStatus.LIVREE, MissionStatus.TERMINEE] };
  } else if (filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.q) {
    where.OR = [
      { contract: { title: { contains: filters.q, mode: "insensitive" } } },
      { client: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  const missions = await prisma.mission.findMany({
    where,
    include: {
      contract: { select: { title: true } },
      client: { select: { name: true } },
    },
  });

  const rows: MissionListRow[] = missions.map((mission) => ({
    id: mission.id,
    contractTitle: mission.contract.title,
    clientName: mission.client.name,
    type: mission.type,
    status: mission.status,
    priceCents: mission.priceCents,
    createdAt: mission.createdAt,
    deadline: mission.deadline,
  }));

  return sortMissions(rows, filters.sort);
}
