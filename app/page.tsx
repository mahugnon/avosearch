import Link from "next/link";
import { ChevronDown, FileText, Scale, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatEuros, pricing } from "@/lib/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

const STEP_ICONS = [FileText, Scale, ShieldCheck] as const;

export default async function LandingPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-brand-surface">
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-7 px-4 py-24 text-center sm:px-6 sm:py-32">
            <Badge
              variant="secondary"
              className="rounded-full border-0 bg-foreground/[0.04] px-3 py-1 font-normal text-muted-foreground"
            >
              {dict.landing.badge}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.1]">
              {dict.landing.heroTitle}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              {dict.landing.heroSubtitle}
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-xl px-7">
                <Link href="/register">{dict.landing.ctaPrimary}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-7">
                <Link href="/register/lawyer">{dict.landing.ctaLawyer}</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/80">{dict.landing.heroDisclaimer}</p>
          </div>
        </section>

        <section id="comment-ca-marche" className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {dict.landing.processEyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                {dict.landing.processTitle}
              </h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {dict.landing.steps.map((step, index) => {
                const Icon = STEP_ICONS[index]!;
                return (
                  <div
                    key={step.title}
                    className="surface-elevated surface-interactive rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-4" aria-hidden />
                      </div>
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tarifs" className="border-t border-border/60 bg-brand-muted">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {dict.landing.pricingEyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                {dict.landing.pricingTitle}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">{dict.landing.pricingSubtitle}</p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              <div className="surface-elevated flex flex-col rounded-2xl p-6">
                <h3 className="font-semibold">{dict.landing.plans[0]!.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {dict.landing.plans[0]!.description}
                </p>
                <p className="mt-8 text-3xl font-semibold tracking-tight">
                  {formatEuros(pricing.aiOnlyCents)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {dict.common.perContract}
                  </span>
                </p>
              </div>
              <div className="relative flex flex-col rounded-2xl bg-foreground p-6 text-background">
                <div className="absolute -top-3 left-6">
                  <Badge className="rounded-full bg-primary text-primary-foreground">
                    {dict.landing.recommended}
                  </Badge>
                </div>
                <h3 className="font-semibold">{dict.landing.plans[1]!.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-background/70">
                  {dict.landing.plans[1]!.description}
                </p>
                <p className="mt-8 text-3xl font-semibold tracking-tight">
                  {formatEuros(pricing.aiPlusLawyerCents)}
                  <span className="text-sm font-normal text-background/60">
                    {dict.common.perContract}
                  </span>
                </p>
              </div>
              <div className="surface-elevated flex flex-col rounded-2xl p-6">
                <h3 className="font-semibold">{dict.landing.plans[2]!.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {dict.landing.plans[2]!.description}
                </p>
                <p className="mt-8 text-3xl font-semibold tracking-tight">
                  {formatEuros(pricing.missionMinCents)} – {formatEuros(pricing.missionMaxCents)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-border/60">
          <div className="mx-auto w-full max-w-2xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {dict.landing.faqEyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                {dict.landing.faqTitle}
              </h2>
            </div>
            <div className="mt-12 divide-y divide-border/60">
              {dict.landing.faq.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                    {item.question}
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-brand-ink">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
            <h2 className="max-w-md text-2xl font-semibold tracking-tight text-white">
              {dict.landing.ctaTitle}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/65">
              {dict.landing.ctaSubtitle}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-1 h-11 rounded-xl bg-white px-7 text-foreground hover:bg-white/90"
            >
              <Link href="/register">{dict.landing.ctaButton}</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
