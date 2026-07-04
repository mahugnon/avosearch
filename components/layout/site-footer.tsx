import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div className="max-w-md space-y-2">
            <p className="text-sm font-semibold">AvoSearch</p>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/legal/cgu" className="hover:text-foreground">
              {t("cgu")}
            </Link>
            <Link href="/legal/mentions-legales" className="hover:text-foreground">
              {t("mentionsLegales")}
            </Link>
            <Link href="/legal/confidentialite" className="hover:text-foreground">
              {t("confidentialite")}
            </Link>
          </nav>
        </div>
        <p className="text-xs text-muted-foreground">{t("demoNotice")}</p>
      </div>
    </footer>
  );
}
