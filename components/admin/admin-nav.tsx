"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AdminNav() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: t("barristers"), match: (p: string) => p === "/admin" },
    {
      href: "/admin/templates",
      label: t("templates"),
      match: (p: string) => p.startsWith("/admin/templates"),
    },
  ];

  return (
    <nav className="flex gap-1 border-b border-border/60">
      {links.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
