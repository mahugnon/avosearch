import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";

export async function LawyerOwnProfile() {
  const session = await auth();
  const t = await getTranslations("lawyer");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: session!.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) notFound();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{t("myProfile")}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile.user.name}</p>
            <p className="text-sm text-muted-foreground">{profile.user.email}</p>
          </div>
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
        {profile.rating != null && (
          <div>
            <p className="text-muted-foreground">{t("profile.rating")}</p>
            <p className="font-medium">
              {profile.rating.toFixed(1)} ({profile.ratingCount})
            </p>
          </div>
        )}
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
        {profile.bio.trim() && (
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">{t("profile.bio")}</p>
            <p className="mt-1 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
