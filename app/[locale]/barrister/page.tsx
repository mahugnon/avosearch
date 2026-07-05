import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { localizedPath, type AppLocale } from "@/lib/i18n";

export default async function BarristerDashboardPage() {
  const locale = (await getLocale()) as AppLocale;
  redirect(localizedPath("/barrister/missions", locale));
}
