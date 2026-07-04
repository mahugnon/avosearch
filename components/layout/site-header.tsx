import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

const ROLE_HOME = {
  CLIENT: "/app",
  LAWYER: "/lawyer",
  ADMIN: "/admin",
} as const;

export async function SiteHeader() {
  const t = await getTranslations("header");
  const session = await auth();
  const role = session?.user?.role;
  const homeHref = role ? ROLE_HOME[role] : null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AvoSearch
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#comment-ca-marche" className="hover:text-foreground">
            {t("howItWorks")}
          </Link>
          <Link href="/#tarifs" className="hover:text-foreground">
            {t("pricing")}
          </Link>
          <Link href="/#faq" className="hover:text-foreground">
            {t("faq")}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {homeHref ? (
            <Button asChild size="sm">
              <Link href={homeHref}>{t("mySpace")}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t("signUp")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
