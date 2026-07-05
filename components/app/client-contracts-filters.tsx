"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ClientContractView, ClientContractsFilters } from "@/lib/contracts/client-contracts-list";
import { useCallback, useEffect, useState, useTransition } from "react";

interface Props {
  filters: ClientContractsFilters;
  resultCount: number;
}

export function ClientContractsFiltersBar({ filters, resultCount }: Props) {
  const t = useTranslations("client");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);

  const updateParams = useCallback(
    (updates: Partial<ClientContractsFilters>) => {
      const next = { ...filters, ...updates };
      const params = new URLSearchParams();
      if (next.q) params.set("q", next.q);
      if (next.view !== "cards") params.set("view", next.view);
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname);
      });
    },
    [filters, pathname, router]
  );

  useEffect(() => {
    setSearch(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== filters.q) updateParams({ q: search });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, filters.q, updateParams]);

  function setView(view: ClientContractView) {
    updateParams({ view });
  }

  return (
    <div className={cn("space-y-3", isPending && "opacity-70")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("contracts.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("contracts.resultCount", { count: resultCount })}</span>
          <div className="flex rounded-lg border p-0.5">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                filters.view === "cards" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setView("cards")}
              aria-pressed={filters.view === "cards"}
            >
              <LayoutGrid className="size-3.5" />
              {t("contracts.view.cards")}
            </button>
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                filters.view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setView("list")}
              aria-pressed={filters.view === "list"}
            >
              <List className="size-3.5" />
              {t("contracts.view.list")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
