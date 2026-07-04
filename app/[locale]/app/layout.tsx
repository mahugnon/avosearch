import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { auth } from "@/lib/auth";
import { localizedPath, type AppLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ClientAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const t = await getTranslations("client");
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "CLIENT") {
    redirect(localizedPath("/login", locale));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        homeHref="/app"
        areaLabel={t("areaLabel")}
        userName={session.user.name ?? session.user.email ?? ""}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-border/60 py-5">
        <p className="mx-auto max-w-3xl px-4 text-center text-xs text-muted-foreground/80 sm:px-6">
          {t("footerDisclaimer")}
        </p>
      </footer>
    </div>
  );
}
