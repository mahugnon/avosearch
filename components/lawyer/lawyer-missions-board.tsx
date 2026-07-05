import { MissionStatus } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { LawyerReviewedBadge } from "@/components/contracts/lawyer-reviewed-badge";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/i18n";
import { getDeadlineUrgency } from "@/lib/lawyer/dashboard-data";
import { isLawyerReviewDelivered } from "@/lib/contracts/lawyer-review";
import type { BoardColumnKey } from "@/lib/lawyer/missions-board";
import {
  getVisibleBoardColumns,
  groupMissionsByBoardColumn,
} from "@/lib/lawyer/missions-board";
import type { MissionListRow } from "@/lib/lawyer/missions-list";

interface LawyerMissionsBoardProps {
  missions: MissionListRow[];
  locale: AppLocale;
  hasAnyMissions: boolean;
  visibleColumns: BoardColumnKey[];
}

export async function LawyerMissionsBoard({
  missions,
  locale,
  hasAnyMissions,
  visibleColumns,
}: LawyerMissionsBoardProps) {
  const t = await getTranslations("lawyer.missions");
  const grouped = groupMissionsByBoardColumn(missions);
  const dateTimeFmt = new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (missions.length === 0) {
    return (
      <div className="surface-elevated rounded-xl px-6 py-12 text-center">
        <p className="text-sm font-medium">
          {hasAnyMissions ? t("emptyFiltered") : t("empty")}
        </p>
        {!hasAnyMissions ? (
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{t("emptyFilteredHint")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {visibleColumns.map((column) => {
        const columnMissions = grouped.get(column) ?? [];

        return (
          <section
            key={column}
            className="flex w-72 shrink-0 flex-col rounded-xl border bg-muted/20"
            aria-label={t(`board.columns.${column}`)}
          >
            <header className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
              <h2 className="text-sm font-semibold">{t(`board.columns.${column}`)}</h2>
              <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                {columnMissions.length}
              </span>
            </header>

            <ul className="flex flex-1 flex-col gap-2 p-2">
              {columnMissions.length === 0 ? (
                <li className="rounded-lg border border-dashed px-3 py-8 text-center text-xs text-muted-foreground">
                  {t("board.emptyColumn")}
                </li>
              ) : (
                columnMissions.map((mission) => {
                  const urgency = getDeadlineUrgency(mission.deadline);

                  return (
                    <li key={mission.id}>
                      <Link
                        href={`/lawyer/missions/${mission.id}`}
                        className="surface-elevated group block rounded-lg p-3 transition-colors hover:bg-card"
                      >
                        <p className="line-clamp-2 text-sm font-medium leading-snug">
                          {mission.contractTitle}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {mission.clientName}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">
                            {t(`status.${mission.status}`)}
                          </Badge>
                          {isLawyerReviewDelivered(mission.status) && (
                            <LawyerReviewedBadge label={t("reviewedBadge")} className="text-[10px]" />
                          )}
                          <Badge variant="secondary" className="text-[10px]">
                            {t(`type.${mission.type}`)}
                          </Badge>
                          <span className="text-xs font-medium">
                            {formatEuros(mission.priceCents, locale)}
                          </span>
                        </div>
                        {(urgency || mission.deadline) && (
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            {urgency === "overdue" && (
                              <Badge variant="destructive" className="text-[10px]">
                                {t("table.deadlineOverdue")}
                              </Badge>
                            )}
                            {urgency === "soon" && (
                              <Badge className="bg-amber-500/15 text-[10px] text-amber-700 hover:bg-amber-500/15 dark:text-amber-400">
                                {t("table.deadlineSoon")}
                              </Badge>
                            )}
                            {mission.deadline && (
                              <span className="text-[10px] text-muted-foreground">
                                {dateTimeFmt.format(mission.deadline)}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="mt-2 flex items-center gap-0.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          {column === MissionStatus.ACCEPTEE
                            ? t("board.actionStart")
                            : t("board.actionOpen")}
                          <ChevronRight className="size-3" aria-hidden />
                        </p>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
