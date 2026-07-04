import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div className="max-w-md space-y-2">
            <p className="text-sm font-semibold">AvoSearch</p>
            <p className="text-sm text-muted-foreground">
              AvoSearch est un outil d&apos;aide documentaire et une plateforme de mise en
              relation avec des avocats inscrits à un barreau français. AvoSearch n&apos;est
              pas un cabinet d&apos;avocats et ne fournit pas de consultation juridique.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/legal/cgu" className="hover:text-foreground">
              Conditions générales d&apos;utilisation
            </Link>
            <Link href="/legal/mentions-legales" className="hover:text-foreground">
              Mentions légales
            </Link>
            <Link href="/legal/confidentialite" className="hover:text-foreground">
              Politique de confidentialité
            </Link>
          </nav>
        </div>
        <p className="text-xs text-muted-foreground">
          Plateforme de démonstration — aucune donnée réelle, aucun avocat réel.
        </p>
      </div>
    </footer>
  );
}
