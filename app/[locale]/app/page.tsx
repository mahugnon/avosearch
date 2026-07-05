import { ChevronRight, FileText, Pencil } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AnalysisChat } from "@/components/app/analysis-chat";
import { LawyerReviewedBy } from "@/components/contracts/lawyer-reviewed-by";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { listClientContracts } from "@/lib/contracts/client-contracts-list";
import { intlLocale, type AppLocale } from "@/lib/i18n";

export default async function ClientHomePage() {
  const session = await auth();
  const t = await getTranslations("client");
  const tc = await getTranslations("contracts");
  const locale = (await getLocale()) as AppLocale;
  const contracts = await listClientContracts(session!.user.id, { q: "", view: "cards" });
  const recent = contracts.slice(0, 4);

  const firstName = (session!.user.name ?? "").split(" ")[0];
  const greeting = firstName ? t("greetingName", { name: firstName }) : t("greeting");

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{greeting}</h1>
        <p className="max-w-lg text-base text-muted-foreground">{t("intro")}</p>
      </header>

      <AnalysisChat />

      {recent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{t("recentContracts")}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("documentsCount", { count: contracts.length })}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/contracts">{t("viewAllContracts")}</Link>
            </Button>
          </div>

          <ul className="space-y-2">
            {recent.map((contract) => {
              const label =
                contract.draftStatus === "IN_PROGRESS"
                  ? tc("draftInProgress")
                  : contract.missionInProgress
                    ? tc("missionInProgress")
                    : tc("readyForLawyer");
              const isDraft = contract.draftStatus === "IN_PROGRESS";
              const href = `/app/contracts/${contract.id}`;

              return (
                <li key={contract.id}>
                  <div className="surface-elevated surface-interactive group flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 sm:px-5">
                    <Link href={href} className="flex min-w-0 flex-1 items-center gap-3.5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{contract.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("uploadedOn", {
                            date: new Intl.DateTimeFormat(intlLocale(locale), {
                              dateStyle: "long",
                            }).format(contract.createdAt),
                          })}
                        </p>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      {contract.reviewedLawyer ? (
                        <LawyerReviewedBy lawyer={contract.reviewedLawyer} locale={locale} />
                      ) : (
                        <Badge variant="outline" className="hidden sm:inline-flex">
                          {label}
                        </Badge>
                      )}
                      {isDraft && (
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
                          <Link href={`/app/contracts/${contract.id}/draft`}>
                            <Pencil className="size-3.5" aria-hidden />
                            {t("contracts.editDraft")}
                          </Link>
                        </Button>
                      )}
                      <Link href={href} aria-hidden className="text-muted-foreground/50">
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
