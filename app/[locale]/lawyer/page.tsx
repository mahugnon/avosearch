import { getLocale, getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("dashboardTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboardIntro")}</p>
      </div>

      {profile && !profile.verified && (
        <Alert>
          <AlertTitle>{t("pendingProfileTitle")}</AlertTitle>
          <AlertDescription>{t("pendingProfileDescription")}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>{t("validationsPending")}</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{t("missionsInProgress")}</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>{t("totalEarnings")}</CardDescription>
            <CardTitle className="text-3xl">{formatEuros(0, locale)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("myProfile")}</CardTitle>
              {profile.verified ? (
                <Badge>{tc("verified")}</Badge>
              ) : (
                <Badge variant="secondary">{tc("pendingVerification")}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">{t("barreau")}</p>
              <p className="font-medium">{profile.barreau}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("city")}</p>
              <p className="font-medium">{profile.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("validationPrice")}</p>
              <p className="font-medium">{formatEuros(profile.validationPriceCents, locale)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("responseTime")}</p>
              <p className="font-medium">
                {t("responseTimeHours", { hours: profile.responseTimeHours })}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">{t("specialties")}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {profile.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
