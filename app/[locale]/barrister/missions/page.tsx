import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { BarristerMissionsBoard } from "@/components/barrister/barrister-missions-board";
import { BarristerMissionsFilters } from "@/components/barrister/barrister-missions-filters";
import { BarristerMissionsTable } from "@/components/barrister/barrister-missions-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getVisibleBoardColumns } from "@/lib/barrister/missions-board";
import {
  getBarristerMissionsList,
  parseMissionListFilters,
} from "@/lib/barrister/missions-list";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BarristerMissionsPage({ searchParams }: Props) {
  const session = await auth();
  const t = await getTranslations("barrister.missions");
  const tl = await getTranslations("barrister");
  const locale = (await getLocale()) as AppLocale;
  const params = await searchParams;

  if (!session || session.user.role !== "BARRISTER") {
    redirect(localizedPath("/login", locale));
  }

  const filters = parseMissionListFilters(params);
  const barristerId = session.user.id;

  const [missions, totalCount, profile] = await Promise.all([
    getBarristerMissionsList(barristerId, filters),
    prisma.mission.count({ where: { barristerId } }),
    prisma.barristerProfile.findUnique({
      where: { userId: barristerId },
      select: { verified: true },
    }),
  ]);

  const visibleColumns = getVisibleBoardColumns(filters.status);

  return (
    <div
      className={cn(
        "space-y-6",
        filters.view === "board" && "-mx-4 sm:-mx-0"
      )}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {profile && !profile.verified && (
        <Alert>
          <AlertTitle>{tl("pendingProfileTitle")}</AlertTitle>
          <AlertDescription>{tl("pendingProfileDescription")}</AlertDescription>
        </Alert>
      )}

      <BarristerMissionsFilters filters={filters} resultCount={missions.length} />

      {filters.view === "board" ? (
        <BarristerMissionsBoard
          missions={missions}
          locale={locale}
          hasAnyMissions={totalCount > 0}
          visibleColumns={visibleColumns}
        />
      ) : (
        <BarristerMissionsTable
          missions={missions}
          locale={locale}
          hasAnyMissions={totalCount > 0}
        />
      )}
    </div>
  );
}
