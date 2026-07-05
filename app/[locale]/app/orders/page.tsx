import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ClientOrdersView } from "@/components/app/client-orders-view";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { listClientOrders } from "@/lib/orders/client-orders-list";
import type { AppLocale } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{ paid?: string }>;
};

export async function generateMetadata() {
  const t = await getTranslations("client.orders");
  return { title: t("title") };
}

export default async function ClientOrdersPage({ searchParams }: Props) {
  const session = await auth();
  const t = await getTranslations("client.orders");
  const locale = (await getLocale()) as AppLocale;
  const { paid } = await searchParams;
  const orders = await listClientOrders(session!.user.id);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/app/settings">{t("back")}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {paid && (
        <Alert>
          <AlertDescription>{t("paymentSuccess")}</AlertDescription>
        </Alert>
      )}

      <ClientOrdersView orders={orders} locale={locale} />
    </div>
  );
}
