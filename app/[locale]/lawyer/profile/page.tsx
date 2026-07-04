import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LawyerOwnProfile } from "@/components/lawyer/lawyer-own-profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function LawyerProfilePage() {
  const session = await auth();
  const t = await getTranslations("lawyer");

  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: session!.user.id },
    select: { verified: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/lawyer">{t("profile.back")}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {profile && !profile.verified && (
        <Alert>
          <AlertTitle>{t("pendingProfileTitle")}</AlertTitle>
          <AlertDescription>{t("pendingProfileDescription")}</AlertDescription>
        </Alert>
      )}

      <LawyerOwnProfile />
    </div>
  );
}
