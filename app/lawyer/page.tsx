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
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function LawyerDashboardPage() {
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const profile = await prisma.lawyerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{dict.lawyer.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.lawyer.subtitle}</p>
      </div>

      {profile && !profile.verified && (
        <Alert>
          <AlertTitle>{dict.lawyer.pendingTitle}</AlertTitle>
          <AlertDescription>{dict.lawyer.pendingDescription}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Validations à traiter</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Missions en cours</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Gains cumulés (démo)</CardDescription>
            <CardTitle className="text-3xl">{formatEuros(0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {profile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mon profil</CardTitle>
              {profile.verified ? (
                <Badge>{dict.admin.verified}</Badge>
              ) : (
                <Badge variant="secondary">{dict.admin.pending}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Barreau</p>
              <p className="font-medium">{profile.barreau}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ville</p>
              <p className="font-medium">{profile.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tarif validation</p>
              <p className="font-medium">{formatEuros(profile.validationPriceCents)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Délai de réponse annoncé</p>
              <p className="font-medium">{profile.responseTimeHours} h</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Spécialités</p>
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
