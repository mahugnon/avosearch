import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const LEGAL_LINKS = [
  { href: "/legal/cgu", key: "cgu" },
  { href: "/legal/confidentialite", key: "confidentialite" },
  { href: "/legal/mentions-legales", key: "mentions" },
  { href: "/legal/registre-traitements", key: "register" },
  { href: "/legal/sous-traitants", key: "subprocessors" },
] as const;

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("legal");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 bg-brand-surface/40 px-4 py-12 sm:px-6">
        <Alert className="mb-8">
          <AlertTitle>{t("draftTitle")}</AlertTitle>
          <AlertDescription>{t("draftDescription")}</AlertDescription>
        </Alert>
        <nav className="mb-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t(`nav.${link.key}`)}
            </Link>
          ))}
        </nav>
        <article className="space-y-6 text-sm leading-relaxed text-muted-foreground [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground [&_table]:text-foreground">
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
