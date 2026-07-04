import { MissionStatus } from "@prisma/client";
import type { MissionListRow, MissionStatusFilter } from "@/lib/lawyer/missions-list";

/** UI column keys — merges LIVREE + TERMINEE into one "done" column. */
export type BoardColumnKey =
  | typeof MissionStatus.ACCEPTEE
  | typeof MissionStatus.EN_COURS
  | "done"
  | typeof MissionStatus.ANNULEE;

export const BOARD_COLUMNS: BoardColumnKey[] = [
  MissionStatus.ACCEPTEE,
  MissionStatus.EN_COURS,
  "done",
  MissionStatus.ANNULEE,
];

const DONE_STATUSES: MissionStatus[] = [
  MissionStatus.LIVREE,
  MissionStatus.TERMINEE,
];

export function isDoneStatus(status: MissionStatus): boolean {
  return DONE_STATUSES.includes(status);
}

export function missionBoardColumn(status: MissionStatus): BoardColumnKey | null {
  if (status === MissionStatus.ACCEPTEE || status === MissionStatus.EN_COURS) {
    return status;
  }
  if (isDoneStatus(status)) return "done";
  if (status === MissionStatus.ANNULEE) return MissionStatus.ANNULEE;
  return null;
}

export function getVisibleBoardColumns(
  status: MissionStatusFilter
): BoardColumnKey[] {
  if (status === "all") return BOARD_COLUMNS;
  if (status === "done") return ["done"];
  if (
    status === MissionStatus.ACCEPTEE ||
    status === MissionStatus.EN_COURS ||
    status === MissionStatus.ANNULEE
  ) {
    return [status];
  }
  if (status === MissionStatus.LIVREE || status === MissionStatus.TERMINEE) {
    return ["done"];
  }
  return BOARD_COLUMNS;
}

export function groupMissionsByBoardColumn(
  missions: MissionListRow[]
): Map<BoardColumnKey, MissionListRow[]> {
  const grouped = new Map<BoardColumnKey, MissionListRow[]>();

  for (const column of BOARD_COLUMNS) {
    grouped.set(column, []);
  }

  for (const mission of missions) {
    const column = missionBoardColumn(mission.status);
    if (!column) continue;
    grouped.get(column)!.push(mission);
  }

  return grouped;
}
