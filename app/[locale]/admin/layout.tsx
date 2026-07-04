import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { auth } from "@/lib/auth";
import { localizedPath, type AppLocale } from "@/lib/i18n";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const t = await getTranslations("admin");
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "ADMIN") {
    redirect(localizedPath("/login", locale));
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        homeHref="/admin"
        areaLabel={t("areaLabel")}
        userName={session.user.name ?? session.user.email ?? ""}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
