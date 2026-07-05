import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { BarristerReviewedBadge } from "@/components/contracts/barrister-reviewed-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/i18n";
import { getDeadlineUrgency } from "@/lib/barrister/dashboard-data";
import { isBarristerReviewDelivered } from "@/lib/contracts/barrister-review";
import type { MissionListRow } from "@/lib/barrister/missions-list";

interface BarristerMissionsTableProps {
  missions: MissionListRow[];
  locale: AppLocale;
  hasAnyMissions: boolean;
}

export async function BarristerMissionsTable({
  missions,
  locale,
  hasAnyMissions,
}: BarristerMissionsTableProps) {
  const t = await getTranslations("barrister.missions");
  const dateFmt = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" });
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
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t("table.contract")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("table.client")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("table.type")}</TableHead>
            <TableHead>{t("table.status")}</TableHead>
            <TableHead className="hidden lg:table-cell">{t("table.amount")}</TableHead>
            <TableHead className="hidden xl:table-cell">{t("table.created")}</TableHead>
            <TableHead className="hidden xl:table-cell">{t("table.deadline")}</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">{t("table.open")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => {
            const urgency = getDeadlineUrgency(mission.deadline);

            return (
              <TableRow key={mission.id} className="group">
                <TableCell>
                  <Link
                    href={`/barrister/missions/${mission.id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {mission.contractTitle}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                    {mission.clientName}
                  </p>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {mission.clientName}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-muted-foreground">{t(`type.${mission.type}`)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{t(`status.${mission.status}`)}</Badge>
                    {isBarristerReviewDelivered(mission.status) && (
                      <BarristerReviewedBadge label={t("reviewedBadge")} className="text-xs" />
                    )}
                    {urgency === "overdue" && (
                      <Badge variant="destructive" className="text-xs">
                        {t("table.deadlineOverdue")}
                      </Badge>
                    )}
                    {urgency === "soon" && (
                      <Badge className="bg-amber-500/15 text-xs text-amber-700 hover:bg-amber-500/15 dark:text-amber-400">
                        {t("table.deadlineSoon")}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {formatEuros(mission.priceCents, locale)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground xl:table-cell">
                  {dateFmt.format(mission.createdAt)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground xl:table-cell">
                  {mission.deadline ? dateTimeFmt.format(mission.deadline) : "—"}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/barrister/missions/${mission.id}`}
                    className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={t("table.openMission", { title: mission.contractTitle })}
                  >
                    <ChevronRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
