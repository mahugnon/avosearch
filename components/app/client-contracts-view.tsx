import { ChevronRight, FileText, FolderOpen, Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LawyerReviewedBy } from "@/components/contracts/lawyer-reviewed-by";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClientContractRow } from "@/lib/contracts/client-contracts-list";
import type { AppLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/i18n";

type Props = {
  contracts: ClientContractRow[];
  locale: AppLocale;
  view: "cards" | "list";
};

function statusLabel(
  contract: ClientContractRow,
  t: Awaited<ReturnType<typeof getTranslations<"contracts">>>
) {
  if (contract.draftStatus === "IN_PROGRESS") return t("draftInProgress");
  if (contract.reviewedLawyer) return null;
  if (contract.missionInProgress) return t("missionInProgress");
  return t("readyForLawyer");
}

export async function ClientContractsView({ contracts, locale, view }: Props) {
  const t = await getTranslations("client");
  const tc = await getTranslations("contracts");
  const dateFmt = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" });

  if (contracts.length === 0) {
    return (
      <div className="surface-elevated flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FolderOpen className="size-5" aria-hidden />
        </div>
        <p className="mt-4 text-sm font-medium">{t("contracts.empty")}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t("contracts.emptyHint")}</p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <ul className="space-y-2">
        {contracts.map((contract) => {
          const label = statusLabel(contract, tc);
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
                      {t("contracts.uploadedOn", { date: dateFmt.format(contract.createdAt) })}
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  {contract.reviewedLawyer ? (
                    <LawyerReviewedBy lawyer={contract.reviewedLawyer} locale={locale} />
                  ) : (
                    label && (
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {label}
                      </Badge>
                    )
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
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {contracts.map((contract) => {
        const label = statusLabel(contract, tc);
        const isDraft = contract.draftStatus === "IN_PROGRESS";
        const href = `/app/contracts/${contract.id}`;
        return (
          <li key={contract.id}>
            <article className="surface-elevated surface-interactive group flex h-full flex-col rounded-2xl p-5">
              <Link href={href} className="flex flex-1 flex-col">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-5" aria-hidden />
                </div>
                <h2 className="mt-4 line-clamp-2 text-base font-semibold leading-snug">{contract.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("contracts.uploadedOn", { date: dateFmt.format(contract.createdAt) })}
                </p>
                <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2">
                  {contract.reviewedLawyer ? (
                    <LawyerReviewedBy lawyer={contract.reviewedLawyer} locale={locale} />
                  ) : (
                    label && <Badge variant="outline">{label}</Badge>
                  )}
                </div>
              </Link>
              <div className="mt-auto flex items-center justify-between pt-4">
                {isDraft ? (
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <Link href={`/app/contracts/${contract.id}/draft`}>
                      <Pencil className="size-3.5" aria-hidden />
                      {t("contracts.editDraft")}
                    </Link>
                  </Button>
                ) : (
                  <span />
                )}
                <Link href={href} aria-hidden className="text-muted-foreground/50">
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
