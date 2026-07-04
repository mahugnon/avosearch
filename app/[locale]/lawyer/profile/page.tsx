import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LawyerOwnProfile } from "@/components/lawyer/lawyer-own-profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLawyerProfileStats } from "@/lib/lawyer/profile-stats";

export default async function LawyerProfilePage() {
  const session = await auth();
  const t = await getTranslations("lawyer");
  const lawyerId = session!.user.id;

  const [profile, stats] = await Promise.all([
    prisma.lawyerProfile.findUnique({
      where: { userId: lawyerId },
      include: { user: { select: { name: true, email: true } } },
    }),
    getLawyerProfileStats(lawyerId),
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

      <LawyerOwnProfile profile={profile} stats={stats} />
    </div>
  );
}
