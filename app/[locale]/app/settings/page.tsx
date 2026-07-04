import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AccountSettings } from "@/components/settings/account-settings";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/app">{t("back")}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AccountSettings />
    </div>
  );
}
