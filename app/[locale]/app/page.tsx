import { FileText } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { intlLocale, type AppLocale } from "@/lib/i18n";

export default async function ClientHomePage() {
  const session = await auth();
  const t = await getTranslations("client");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  const contracts = await prisma.contract.findMany({
    where: { ownerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true, analysis: { select: { triage: true } } },
  });

  const firstName = (session!.user.name ?? "").split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("greeting", {
            firstName: firstName ? t("greetingFirstName", { firstName }) : "",
          })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("newAnalysis")}</CardTitle>
            <Badge variant="secondary">{t("phase1Badge")}</Badge>
          </div>
          <CardDescription>{t("newAnalysisDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder={t("questionPlaceholder")} rows={4} disabled />
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">{t("phase1Hint")}</p>
            <Button disabled>{t("analyze")}</Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">{t("myContracts")}</h2>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noContracts")}</p>
        ) : (
          <ul className="space-y-3">
            {contracts.map((contract) => (
              <li key={contract.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
                      <div>
                        <p className="text-sm font-medium">{contract.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("uploadedOn", {
                            date: new Intl.DateTimeFormat(intlLocale(locale), {
                              dateStyle: "long",
                            }).format(contract.createdAt),
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {contract.analysis ? tc("analyzed") : tc("awaitingAnalysis")}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
