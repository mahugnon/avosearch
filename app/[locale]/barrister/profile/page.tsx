import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BarristerOwnProfile } from "@/components/barrister/barrister-own-profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBarristerProfileStats } from "@/lib/barrister/profile-stats";

export default async function BarristerProfilePage() {
  const session = await auth();
  const t = await getTranslations("barrister");
  const barristerId = session!.user.id;

  const [profile, stats] = await Promise.all([
    prisma.barristerProfile.findUnique({
      where: { userId: barristerId },
      include: { user: { select: { name: true, email: true } } },
    }),
    getBarristerProfileStats(barristerId),
  ]);

  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {!profile.verified && (
        <Alert>
          <AlertTitle>{t("pendingProfileTitle")}</AlertTitle>
          <AlertDescription>{t("pendingProfileDescription")}</AlertDescription>
        </Alert>
      )}

      <BarristerOwnProfile profile={profile} stats={stats} />
    </div>
  );
}
