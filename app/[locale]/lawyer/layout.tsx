import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { LawyerSidebar } from "@/components/lawyer/lawyer-sidebar";
import { auth } from "@/lib/auth";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { getLawyerActionCount } from "@/lib/lawyer/dashboard-data";

export const dynamic = "force-dynamic";

export default async function LawyerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const t = await getTranslations("lawyer");
  const locale = (await getLocale()) as AppLocale;

  if (!session || session.user.role !== "LAWYER") {
    redirect(localizedPath("/login", locale));
  }

  const actionCount = await getLawyerActionCount(session.user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        homeHref="/lawyer/missions"
        areaLabel={t("areaLabel")}
        userName={session.user.name ?? session.user.email ?? ""}
        profileHref="/lawyer/profile"
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <LawyerSidebar actionCount={actionCount} />
        <main className="flex-1 overflow-auto px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
