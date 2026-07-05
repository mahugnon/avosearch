import { ChevronRight, Scale } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { formatEuros } from "@/lib/config";
import type { ClientOrderRow } from "@/lib/orders/client-orders-list";
import type { AppLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/i18n";

type Props = {
  orders: ClientOrderRow[];
  locale: AppLocale;
};

export async function ClientOrdersView({ orders, locale }: Props) {
  const t = await getTranslations("client.orders");
  const tm = await getTranslations("missions");
  const dateFmt = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" });

  if (orders.length === 0) {
    return (
      <div className="surface-elevated flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Scale className="size-5" aria-hidden />
        </div>
        <p className="mt-4 text-sm font-medium">{t("empty")}</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t("emptyHint")}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {orders.map((order) => {
        const price = order.finalPriceCents ?? order.priceCents;
        return (
          <li key={order.id}>
            <Link href={`/app/missions/${order.id}`} className="block">
              <div className="surface-elevated surface-interactive group flex items-center justify-between gap-4 rounded-xl px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Scale className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{order.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.lawyerName ? t("lawyerLine", { name: order.lawyerName }) : t("lawyerPending")} ·{" "}
                      {formatEuros(price, locale)} · {dateFmt.format(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{tm(`status.${order.status}`)}</Badge>
                  <ChevronRight
                    className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
              </div>
            </Link>
            {order.hasDeliveredDocument && (
              <p className="mt-1 px-4 text-xs text-muted-foreground sm:px-5">
                <Link href={`/app/contracts/${order.contractId}`} className="text-primary hover:underline">
                  {t("viewContract")}
                </Link>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
