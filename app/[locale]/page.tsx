import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatEuros, pricing } from "@/lib/config";
import type { AppLocale } from "@/lib/i18n";

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
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden border-b border-border">
          <span className="section-mark absolute -top-24 right-0 select-none text-[22rem] sm:text-[30rem]">
            §
          </span>
          <div className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
            <p className="rule-kicker eyebrow">{t("heroBadge")}</p>
            <h1 className="mt-9 max-w-4xl font-display text-5xl leading-[1.05] sm:text-7xl">
              {t.rich("heroTitle", {
                em: (chunks) => <em className="text-primary not-italic">{chunks}</em>,
              })}
            </h1>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t("heroDescription")}
            </p>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 px-9 text-base">
                <Link href="/register">
                  {t("analyzeContract")} <span aria-hidden>→</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 border-foreground px-9 text-base">
                <Link href="/register/barrister">{t("iAmBarrister")}</Link>
              </Button>
            </div>
            <p className="mt-8 font-display text-lg italic text-muted-foreground">
              {t("disclaimer")}
            </p>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="comment-ca-marche" className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-display text-4xl sm:text-5xl">{t("howItWorksTitle")}</h2>
              <span className="eyebrow">{t("howItWorksKicker")}</span>
            </div>
            <div className="mt-14 border-t border-input">
              {STEP_KEYS.map((key, index) => (
                <div
                  key={key}
                  className="grid items-baseline gap-6 border-b border-input py-10 sm:grid-cols-[6rem_22rem_1fr] sm:gap-10"
                >
                  <span className="font-display text-4xl italic text-primary">
                    0{index + 1}
                  </span>
                  <h3 className="font-display text-2xl font-normal sm:text-3xl">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {t(`steps.${key}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PLANS ============ */}
        <section id="tarifs" className="border-b border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <h2 className="font-display text-4xl sm:text-5xl">{t("pricingTitle")}</h2>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">{t("pricingSubtitle")}</p>
            <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3">
              {/* Assisted review */}
              <div className="flex flex-col gap-5 rounded-xl border border-border p-9">
                <span className="eyebrow">{t("plans.aiOnly.title")}</span>
                <p className="font-display text-6xl">
                  {formatEuros(pricing.aiOnlyCents, locale)}
                  <span className="ml-1 align-middle text-base text-muted-foreground">
                    {tc("perContract")}
                  </span>
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("plans.aiOnly.description")}
                </p>
                <Button asChild variant="outline" className="mt-auto h-12 border-foreground">
                  <Link href="/register">{t("analyzeContract")}</Link>
                </Button>
              </div>

              {/* Review + barrister validation (recommended, dark card) */}
              <div className="dark relative flex flex-col gap-5 rounded-xl bg-brand-ink p-9 text-card-foreground shadow-2xl">
                <Badge className="absolute -top-3 left-9">{tc("recommended")}</Badge>
                <span className="eyebrow" style={{ color: "#8fa0d8" }}>
                  {t("plans.aiBarrister.title")}
                </span>
                <p className="font-display text-6xl text-[#f7f5ef]">
                  {formatEuros(pricing.aiPlusBarristerCents, locale)}
                  <span className="ml-1 align-middle text-base" style={{ color: "#8fa0d8" }}>
                    {tc("perContract")}
                  </span>
                </p>
                <p className="text-sm leading-relaxed text-[#b9c2d8]">
                  {t("plans.aiBarrister.description")}
                </p>
                <Button asChild className="mt-auto h-12">
                  <Link href="/register">{t("ctaButton")}</Link>
                </Button>
              </div>

              {/* Flat-fee mission */}
              <div className="flex flex-col gap-5 rounded-xl border border-border p-9">
                <span className="eyebrow">{t("plans.mission.title")}</span>
                <p className="font-display text-6xl">
                  {formatEuros(pricing.missionMinCents, locale)}
                  <span className="text-muted-foreground">–</span>
                  {formatEuros(pricing.missionMaxCents, locale)}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t("plans.mission.description")}
                </p>
                <Button asChild variant="outline" className="mt-auto h-12 border-foreground">
                  <Link href="/register">{t("iAmBarrister")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="border-b border-border">
          <div className="mx-auto w-full max-w-3xl px-6 py-24">
            <h2 className="font-display text-4xl sm:text-5xl">{t("faqTitle")}</h2>
            <div className="mt-12 border-t border-input">
              {FAQ_KEYS.map((key) => (
                <details key={key} className="group border-b border-input py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                    {t(`faq.${key}.question`)}
                    <span className="text-primary transition-transform group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(`faq.${key}.answer`)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="relative overflow-hidden">
          <span className="section-mark absolute -bottom-40 left-4 select-none text-[24rem]">
            §
          </span>
          <div className="relative mx-auto flex w-full max-w-3xl flex-col items-start gap-5 px-6 py-24">
            <h2 className="font-display text-4xl sm:text-5xl">{t("ctaTitle")}</h2>
            <p className="max-w-xl text-base text-muted-foreground">{t("ctaDescription")}</p>
            <Button asChild size="lg" className="mt-2 h-14 px-9 text-base">
              <Link href="/register">
                {t("ctaButton")} <span aria-hidden>→</span>
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
