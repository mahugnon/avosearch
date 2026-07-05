import { FileText, Scale, ShieldCheck } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatEuros, pricing } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";

const STEP_ICONS = [FileText, Scale, ShieldCheck] as const;
const STEP_KEYS = ["1", "2", "3"] as const;
const FAQ_KEYS = ["1", "2", "3", "4", "5"] as const;

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");
  const locale = (await getLocale()) as AppLocale;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge variant="secondary">{t("heroBadge")}</Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t("heroDescription")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">{t("analyzeContract")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register/barrister">{t("iAmBarrister")}</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
        </section>

        <section id="comment-ca-marche" className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              {t("howItWorksTitle")}
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEP_KEYS.map((key, index) => {
                const Icon = STEP_ICONS[index];
                return (
                  <Card key={key}>
                    <CardHeader>
                      <Icon className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden />
                      <CardTitle className="text-lg">{t(`steps.${key}.title`)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {t(`steps.${key}.description`)}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tarifs" className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              {t("pricingTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
              {t("pricingSubtitle")}
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>{t("plans.aiOnly.title")}</CardTitle>
                  <CardDescription>{t("plans.aiOnly.description")}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-3xl font-semibold">
                    {formatEuros(pricing.aiOnlyCents, locale)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      {tc("perContract")}
                    </span>
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col border-foreground/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("plans.aiBarrister.title")}</CardTitle>
                    <Badge>{tc("recommended")}</Badge>
                  </div>
                  <CardDescription>{t("plans.aiBarrister.description")}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-3xl font-semibold">
                    {formatEuros(pricing.aiPlusBarristerCents, locale)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      {tc("perContract")}
                    </span>
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>{t("plans.mission.title")}</CardTitle>
                  <CardDescription>{t("plans.mission.description")}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-3xl font-semibold">
                    {formatEuros(pricing.missionMinCents, locale)} –{" "}
                    {formatEuros(pricing.missionMaxCents, locale)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t bg-muted/30">
          <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">{t("faqTitle")}</h2>
            <div className="mt-10 space-y-4">
              {FAQ_KEYS.map((key) => (
                <details key={key} className="group rounded-lg border bg-background p-4">
                  <summary className="cursor-pointer list-none text-sm font-medium">
                    {t(`faq.${key}.question`)}
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{t(`faq.${key}.answer`)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">{t("ctaTitle")}</h2>
            <p className="max-w-xl text-sm text-muted-foreground">{t("ctaDescription")}</p>
            <Button asChild size="lg">
              <Link href="/register">{t("ctaButton")}</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
