import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

const ROLE_HOME = {
  CLIENT: "/app",
  LAWYER: "/lawyer",
  ADMIN: "/admin",
} as const;

export async function SiteHeader() {
  const t = await getTranslations("header");
  const session = await auth();
  const homeHref = session ? ROLE_HOME[session.user.role] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo priority />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#comment-ca-marche" className="transition-colors hover:text-foreground">
            {t("howItWorks")}
          </Link>
          <Link href="/#tarifs" className="transition-colors hover:text-foreground">
            {t("pricing")}
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-foreground">
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
