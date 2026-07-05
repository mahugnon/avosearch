import { Check, X } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatEuros, pricing } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n";

const STEP_KEYS = ["1", "2", "3"] as const;
const FAQ_KEYS = ["1", "2", "3", "4", "5"] as const;
const ROADMAP_STAGES = ["now", "next", "then", "later", "beyond"] as const;

type CompetitionRow = {
  player: string;
  note: string;
  price: string;
  ai: boolean;
  barrister: boolean;
  fixed: boolean;
  fast: boolean;
};

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check className="mx-auto size-4 text-foreground" aria-hidden />
  ) : (
    <X className="mx-auto size-4 text-muted-foreground/40" aria-hidden />
  );
}

export default async function LandingPage() {
  const t = await getTranslations("landing");
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
          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-24 text-center sm:py-32">
            <p className="rule-kicker eyebrow justify-center">{t("heroBadge")}</p>
            <h1 className="mt-9 font-display text-5xl leading-[1.05] sm:text-7xl">
              {t.rich("heroTitle", {
                em: (chunks) => <em className="text-primary not-italic">{chunks}</em>,
              })}
            </h1>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t("heroDescription")}
            </p>
            <div className="mt-11 flex flex-col justify-center gap-3 sm:flex-row">
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
              {/* Basic */}
              <div className="flex flex-col rounded-xl border border-border p-8">
                <span className="eyebrow">{t("plans.basic.eyebrow")}</span>
                <h3 className="mt-3 font-display text-3xl font-normal">{t("plans.basic.name")}</h3>
                <ul className="mt-6 space-y-2.5">
                  {(t.raw("plans.basic.features") as string[]).map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-8 text-sm leading-relaxed text-muted-foreground">
                  {t("plans.basic.footnote")}
                </p>
                <hr className="my-5 border-input" />
                <p className="font-display text-4xl">
                  {formatEuros(pricing.basicCents, locale)}
                  <span className="ml-2 align-middle text-sm font-normal font-sans text-muted-foreground">
                    · {t("plans.workingHours", { count: pricing.basicHours })}
                  </span>
                </p>
              </div>

              {/* Express (highlighted) */}
              <div className="flex flex-col rounded-xl border-2 border-primary bg-card p-8 shadow-lg">
                <span className="eyebrow text-primary">{t("plans.express.eyebrow")}</span>
                <h3 className="mt-3 font-display text-3xl font-normal">{t("plans.express.name")}</h3>
                <ul className="mt-6 space-y-2.5">
                  {(t.raw("plans.express.features") as string[]).map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-8 text-sm leading-relaxed text-muted-foreground">
                  {t("plans.express.footnote")}
                </p>
                <hr className="my-5 border-input" />
                <p className="font-display text-4xl">
                  {formatEuros(pricing.expressCents, locale)}
                  <span className="ml-2 align-middle text-sm font-medium font-sans text-primary">
                    · {t("plans.workingHours", { count: pricing.expressHours })}
                  </span>
                </p>
              </div>

              {/* Complex */}
              <div className="flex flex-col rounded-xl border border-border p-8">
                <span className="eyebrow">{t("plans.complex.eyebrow")}</span>
                <h3 className="mt-3 font-display text-3xl font-normal">{t("plans.complex.name")}</h3>
                <ul className="mt-6 space-y-2.5">
                  {(t.raw("plans.complex.features") as string[]).map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-8 text-sm leading-relaxed text-muted-foreground">
                  {t("plans.complex.footnote")}
                </p>
                <hr className="my-5 border-input" />
                <p className="font-display text-4xl">
                  {formatEuros(pricing.complexMinCents, locale)}
                  <span className="text-muted-foreground">–</span>
                  {formatEuros(pricing.complexMaxCents, locale)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ ROADMAP ============ */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <p className="eyebrow text-primary">{t("roadmap.eyebrow")}</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl sm:text-5xl">
              {t("roadmap.title")}
            </h2>
            <div className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
              {ROADMAP_STAGES.map((stage, index) => {
                const beyond = stage === "beyond";
                return (
                  <div
                    key={stage}
                    className={cn(
                      "flex flex-col",
                      beyond && "rounded-xl bg-brand-ink p-6 text-[#f7f5ef] lg:-mt-6"
                    )}
                  >
                    {!beyond && (
                      <div className="mb-5 flex items-center gap-2">
                        <span
                          className={cn(
                            "size-3.5 rounded-full border-2",
                            index === 0
                              ? "border-primary bg-primary"
                              : "border-border bg-background"
                          )}
                          aria-hidden
                        />
                        <span className="h-px flex-1 bg-border" aria-hidden />
                      </div>
                    )}
                    <span
                      className={cn("eyebrow", beyond ? "text-[#8fa0d8]" : "text-muted-foreground")}
                    >
                      {t(`roadmap.stages.${stage}.phase`)}
                    </span>
                    <h3
                      className={cn(
                        "mt-2 text-xl font-semibold",
                        beyond && "text-[#f7f5ef]"
                      )}
                    >
                      {t(`roadmap.stages.${stage}.title`)}
                    </h3>
                    <p
                      className={cn(
                        "mt-3 text-sm leading-relaxed",
                        beyond ? "text-[#b9c2d8]" : "text-muted-foreground"
                      )}
                    >
                      {t(`roadmap.stages.${stage}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ COMPETITION ============ */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <p className="eyebrow text-primary">{t("competition.eyebrow")}</p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">{t("competition.title")}</h2>
            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-foreground/20">
                    <th className="eyebrow py-3 pr-4 font-semibold">{t("competition.columns.player")}</th>
                    <th className="eyebrow py-3 pr-4 font-semibold">{t("competition.columns.price")}</th>
                    <th className="eyebrow py-3 text-center font-semibold">{t("competition.columns.ai")}</th>
                    <th className="eyebrow py-3 text-center font-semibold">{t("competition.columns.barrister")}</th>
                    <th className="eyebrow py-3 text-center font-semibold">{t("competition.columns.fixedPrice")}</th>
                    <th className="eyebrow py-3 text-center font-semibold">{t("competition.columns.fast")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(t.raw("competition.rows") as CompetitionRow[]).map((row) => (
                    <tr key={row.player} className="border-b border-border">
                      <td className="py-4 pr-4">
                        <span className="font-medium">{row.player}</span>
                        {row.note && (
                          <span className="ml-1.5 text-muted-foreground/70">({row.note})</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-sm text-muted-foreground">{row.price}</td>
                      <td className="py-4"><Cell on={row.ai} /></td>
                      <td className="py-4"><Cell on={row.barrister} /></td>
                      <td className="py-4"><Cell on={row.fixed} /></td>
                      <td className="py-4"><Cell on={row.fast} /></td>
                    </tr>
                  ))}
                  <tr className="bg-brand-ink text-[#f7f5ef]">
                    <td className="rounded-l-lg py-4 pl-4 font-semibold">
                      {t("competition.avosearch.name")}
                    </td>
                    <td className="py-4 pr-4 text-sm text-[#b9c2d8]">
                      {t("competition.avosearch.price")}
                    </td>
                    {[0, 1, 2, 3].map((i) => (
                      <td key={i} className={cn("py-4", i === 3 && "rounded-r-lg")}>
                        <Check className="mx-auto size-4 text-[#f7f5ef]" aria-hidden />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
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
