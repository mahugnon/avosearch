import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function ClientAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        homeHref="/app"
        area="client"
        userName={session.user.name ?? session.user.email ?? ""}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-border/60 py-5">
        <p className="mx-auto max-w-3xl px-4 text-center text-xs text-muted-foreground/80 sm:px-6">
          {dict.common.demoDisclaimer}
        </p>
      </footer>
    </div>
  );
}
