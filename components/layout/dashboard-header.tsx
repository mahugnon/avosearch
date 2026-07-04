import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

interface DashboardHeaderProps {
  homeHref: string;
  areaLabel: string;
  userName: string;
}

export async function DashboardHeader({ homeHref, areaLabel, userName }: DashboardHeaderProps) {
  const t = await getTranslations("header");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href={homeHref} className="text-lg font-semibold tracking-tight">
            AvoSearch
          </Link>
          <Badge variant="secondary">{areaLabel}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              {t("signOut")}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
