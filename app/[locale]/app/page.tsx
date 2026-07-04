import { ChevronRight, FileText, FolderOpen } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AnalysisChat } from "@/components/app/analysis-chat";
import { Badge } from "@/components/ui/badge";
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
  const greeting = firstName ? t("greetingName", { name: firstName }) : t("greeting");

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{greeting}</h1>
        <p className="max-w-lg text-base text-muted-foreground">{t("intro")}</p>
      </header>

      <AnalysisChat />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t("recentContracts")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {contracts.length === 0
              ? t("documentsEmpty")
              : t("documentsCount", { count: contracts.length })}
          </p>
        </div>

        {contracts.length === 0 ? (
          <div className="surface-elevated flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FolderOpen className="size-5" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium">{t("emptyTitle")}</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t("emptyHint")}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {contracts.map((contract) => (
              <li key={contract.id}>
                <div className="surface-elevated surface-interactive group flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 sm:px-5">
                  <div className="flex min-w-0 items-center gap-3.5">
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
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={contract.analysis ? "secondary" : "outline"}
                      className="hidden sm:inline-flex"
                    >
                      {contract.analysis ? tc("analyzed") : tc("pending")}
                    </Badge>
                    <ChevronRight
                      className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
