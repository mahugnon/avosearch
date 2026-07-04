import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

const ROLE_HOME = {
  CLIENT: "/app",
  LAWYER: "/lawyer",
  ADMIN: "/admin",
} as const;

export async function SiteHeader() {
  const session = await auth();
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const homeHref = session ? ROLE_HOME[session.user.role] : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo priority />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#comment-ca-marche" className="transition-colors hover:text-foreground">
            {dict.landing.navHow}
          </Link>
          <Link href="/#tarifs" className="transition-colors hover:text-foreground">
            {dict.landing.navPricing}
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-foreground">
            {dict.landing.navFaq}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {homeHref ? (
            <Button asChild size="sm">
              <Link href={homeHref}>{dict.common.mySpace}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{dict.common.signIn}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{dict.common.signUp}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
