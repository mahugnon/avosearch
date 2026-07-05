"use client";

import { MissionStatus } from "@prisma/client";
import { LayoutGrid, List, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  MissionListFilters,
  MissionListView,
  MissionSortKey,
  MissionStatusFilter,
} from "@/lib/lawyer/missions-list";
import { useCallback, useEffect, useState, useTransition } from "react";

const STATUS_OPTIONS: MissionStatusFilter[] = [
  "active",
  "all",
  MissionStatus.ACCEPTEE,
  MissionStatus.EN_COURS,
  "done",
  MissionStatus.ANNULEE,
];

const SORT_OPTIONS: MissionSortKey[] = [
  "createdAt:desc",
  "createdAt:asc",
  "deadline:asc",
  "deadline:desc",
  "price:desc",
  "price:asc",
  "status:asc",
];

interface LawyerMissionsFiltersProps {
  filters: MissionListFilters;
  resultCount: number;
}

export function LawyerMissionsFilters({
  filters,
  resultCount,
}: LawyerMissionsFiltersProps) {
  const t = useTranslations("lawyer.missions");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);

  const updateParams = useCallback(
    (updates: Partial<MissionListFilters>) => {
      const next = { ...filters, ...updates };
      const params = new URLSearchParams();

      if (next.q) params.set("q", next.q);
      if (next.status !== "active") params.set("status", next.status);
      if (next.sort !== "createdAt:desc") params.set("sort", next.sort);
      if (next.view !== "table") params.set("view", next.view);

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
      if (search !== filters.q) {
        updateParams({ q: search });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, filters.q, updateParams]);

  const hasActiveFilters =
    filters.q !== "" ||
    filters.status !== "active" ||
    filters.sort !== "createdAt:desc";

  const viewOptions: { value: MissionListView; icon: typeof LayoutGrid; labelKey: "board" | "table" }[] = [
    { value: "board", icon: LayoutGrid, labelKey: "board" },
    { value: "table", icon: List, labelKey: "table" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="pl-8"
            aria-label={t("filters.searchPlaceholder")}
          />
        </div>

          <Select
            value={filters.sort}
            onValueChange={(value) => updateParams({ sort: value as MissionSortKey })}
          >
            <SelectTrigger className="w-full sm:w-52" aria-label={t("filters.sortLabel")}>
              <SelectValue placeholder={t("filters.sortLabel")} />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`filters.sort.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className="flex shrink-0 rounded-lg border border-border/60 p-0.5"
          role="group"
          aria-label={t("filters.viewLabel")}
        >
          {viewOptions.map(({ value, icon: Icon, labelKey }) => {
            const active = filters.view === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateParams({ view: value })}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-pressed={active}
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden sm:inline">{t(`filters.view.${labelKey}`)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label={t("filters.statusLabel")}
      >
        {STATUS_OPTIONS.map((status) => {
          const active = filters.status === status;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => updateParams({ status })}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t(`filters.status.${status}`)}
            </button>
          );
        })}
      </div>

      <p
        className={cn(
          "text-sm text-muted-foreground",
          isPending && "opacity-60"
        )}
      >
        {t("filters.resultCount", { count: resultCount })}
        {hasActiveFilters && (
          <>
            {" · "}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateParams({ q: "", status: "active", sort: "createdAt:desc", view: filters.view });
              }}
              className="font-medium text-primary hover:underline"
            >
              {t("filters.clear")}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
