import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

const ROLE_HOME = {
  CLIENT: "/app",
  LAWYER: "/lawyer",
  ADMIN: "/admin",
} as const;

export async function SiteHeader() {
  const session = await auth();
  const homeHref = session ? ROLE_HOME[session.user.role] : null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AvoSearch
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#comment-ca-marche" className="hover:text-foreground">
            Comment ça marche
          </Link>
          <Link href="/#tarifs" className="hover:text-foreground">
            Tarifs
          </Link>
          <Link href="/#faq" className="hover:text-foreground">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {homeHref ? (
            <Button asChild size="sm">
              <Link href={homeHref}>Mon espace</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
