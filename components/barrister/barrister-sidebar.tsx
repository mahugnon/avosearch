"use client";

import { Briefcase, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface BarristerSidebarProps {
  actionCount: number;
}

type NavItem = {
  href: string;
  labelKey: "missions" | "profile";
  icon: typeof Briefcase;
  match: (pathname: string) => boolean;
  showBadge?: boolean;
};

function isMissionsArea(pathname: string): boolean {
  return (
    pathname === "/barrister" ||
    pathname.startsWith("/barrister/missions") ||
    pathname.startsWith("/barrister/contracts")
  );
}

export function BarristerSidebar({ actionCount }: BarristerSidebarProps) {
  const t = useTranslations("barrister.nav");
  const pathname = usePathname();

  const items: NavItem[] = [
    {
      href: "/barrister/missions",
      labelKey: "missions",
      icon: Briefcase,
      match: isMissionsArea,
      showBadge: true,
    },
    {
      href: "/barrister/profile",
      labelKey: "profile",
      icon: UserCircle,
      match: (p) => p.startsWith("/barrister/profile"),
    },
  ];

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <nav className="flex flex-col gap-1 p-3" aria-label={t("label")}>
          {items.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            const badge =
              item.showBadge && actionCount > 0 ? actionCount : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="flex-1 truncate">{t(item.labelKey)}</span>
                {badge !== null && (
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/15 text-primary"
                    )}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        className="flex gap-1 overflow-x-auto border-b border-border/60 bg-sidebar px-3 py-2 md:hidden"
        aria-label={t("label")}
      >
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          const badge = item.showBadge && actionCount > 0 ? actionCount : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              <span>{t(item.labelKey)}</span>
              {badge !== null && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
