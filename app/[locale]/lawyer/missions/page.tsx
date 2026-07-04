import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { LawyerMissionsBoard } from "@/components/lawyer/lawyer-missions-board";
import { LawyerMissionsFilters } from "@/components/lawyer/lawyer-missions-filters";
import { LawyerMissionsTable } from "@/components/lawyer/lawyer-missions-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getVisibleBoardColumns } from "@/lib/lawyer/missions-board";
import {
  getLawyerMissionsList,
  parseMissionListFilters,
} from "@/lib/lawyer/missions-list";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LawyerMissionsPage({ searchParams }: Props) {
  const session = await auth();
  const t = await getTranslations("lawyer.missions");
  const tl = await getTranslations("lawyer");
  const locale = (await getLocale()) as AppLocale;
  const params = await searchParams;

  if (!session || session.user.role !== "LAWYER") {
    redirect(localizedPath("/login", locale));
  }

  const filters = parseMissionListFilters(params);
  const lawyerId = session.user.id;

  const [missions, totalCount, profile] = await Promise.all([
    getLawyerMissionsList(lawyerId, filters),
    prisma.mission.count({ where: { lawyerId } }),
    prisma.lawyerProfile.findUnique({
      where: { userId: lawyerId },
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

      <LawyerMissionsFilters filters={filters} resultCount={missions.length} />

      {filters.view === "board" ? (
        <LawyerMissionsBoard
          missions={missions}
          locale={locale}
          hasAnyMissions={totalCount > 0}
          visibleColumns={visibleColumns}
        />
      ) : (
        <LawyerMissionsTable
          missions={missions}
          locale={locale}
          hasAnyMissions={totalCount > 0}
        />
      )}
    </div>
  );
}
