import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ClientContractsFiltersBar } from "@/components/app/client-contracts-filters";
import { ClientContractsView } from "@/components/app/client-contracts-view";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  listClientContracts,
  parseClientContractsFilters,
} from "@/lib/contracts/client-contracts-list";
import type { AppLocale } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ q?: string; view?: string }>;
};

export async function generateMetadata() {
  const t = await getTranslations("client");
  return { title: t("contracts.title") };
}

export default async function ClientContractsPage({ searchParams }: Props) {
  const session = await auth();
  const t = await getTranslations("client");
  const locale = (await getLocale()) as AppLocale;
  const params = await searchParams;
  const filters = parseClientContractsFilters(params);
  const contracts = await listClientContracts(session!.user.id, filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/app">{t("contracts.back")}</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{t("contracts.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("contracts.subtitle")}</p>
        </div>
      </div>

      <ClientContractsFiltersBar filters={filters} resultCount={contracts.length} />
      <ClientContractsView contracts={contracts} locale={locale} view={filters.view} />
    </div>
  );
}
