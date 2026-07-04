import { MissionStatus } from "@prisma/client";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";

export default async function LawyerDashboardPage() {
  const session = await auth();
  const t = await getTranslations("lawyer");
  const locale = (await getLocale()) as AppLocale;

  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const missions = await prisma.mission.findMany({
    where: { lawyerId: session!.user.id },
    select: { status: true, priceCents: true },
  });

  const validationsPending = missions.filter(
    (m) => m.status === MissionStatus.ACCEPTEE || m.status === MissionStatus.EN_COURS
  ).length;
  const inProgress = missions.filter((m) => m.status === MissionStatus.EN_COURS).length;
  const earnings = missions
    .filter((m) => m.status === MissionStatus.TERMINEE || m.status === MissionStatus.LIVREE)
    .reduce((sum, m) => sum + m.priceCents, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("dashboardTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboardIntro")}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/lawyer/missions">{t("viewMissions")}</Link>
        </Button>
      </div>

      {profile && !profile.verified && (
        <Alert>
          <AlertTitle>{t("pendingProfileTitle")}</AlertTitle>
          <AlertDescription>{t("pendingProfileDescription")}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        <Link
          href="/lawyer/missions"
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="surface-interactive h-full transition-colors hover:bg-muted/25">
            <CardHeader>
              <CardDescription>{t("validationsPending")}</CardDescription>
              <CardTitle className="text-3xl">{validationsPending}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link
          href="/lawyer/missions"
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="surface-interactive h-full transition-colors hover:bg-muted/25">
            <CardHeader>
              <CardDescription>{t("missionsInProgress")}</CardDescription>
              <CardTitle className="text-3xl">{inProgress}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Card>
          <CardHeader>
            <CardDescription>{t("totalEarnings")}</CardDescription>
            <CardTitle className="text-3xl">{formatEuros(earnings, locale)}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
