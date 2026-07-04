import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

interface DashboardHeaderProps {
  homeHref: string;
  areaLabel: string;
  userName: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export async function DashboardHeader({ homeHref, areaLabel, userName }: DashboardHeaderProps) {
  const t = await getTranslations("header");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href={homeHref} className="shrink-0">
            <Logo />
          </Link>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <span className="hidden text-sm text-muted-foreground sm:inline">{areaLabel}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          {homeHref === "/app" && (
            <Button asChild variant="ghost" size="sm" className="hidden text-muted-foreground sm:inline-flex">
              <Link href="/app/settings">{t("settings")}</Link>
            </Button>
          )}
          <div className="hidden items-center gap-2.5 sm:flex">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {initials(userName)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[10rem] truncate text-sm text-muted-foreground">
              {userName}
            </span>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-muted-foreground">
              {t("signOut")}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
