import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 bg-brand-surface/40 px-4 py-12 sm:px-6">
        <Alert className="mb-8">
          <AlertTitle>Document de travail</AlertTitle>
          <AlertDescription>
            À faire valider par un avocat avant mise en production.
          </AlertDescription>
        </Alert>
        <article className="space-y-6 text-sm leading-relaxed text-muted-foreground [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:text-foreground">
          {children}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
