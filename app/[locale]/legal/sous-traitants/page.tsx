import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

const VENDOR_KEYS = ["1", "2", "3", "4"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("sousTraitants") };
}

export default async function SousTraitantsPage() {
  const t = await getTranslations("legal.subprocessors");

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="text-xs">{t("lastUpdated")}</p>
      <p>{t("intro")}</p>
      <section className="space-y-6">
        {VENDOR_KEYS.map((key) => (
          <article key={key} className="rounded-lg border p-4">
            <h2 className="text-base font-semibold text-foreground">{t(`vendors.${key}.name`)}</h2>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">{t("role")}</dt>
                <dd>{t(`vendors.${key}.role`)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-muted-foreground">{t("location")}</dt>
                <dd>{t(`vendors.${key}.location`)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-muted-foreground">{t("data")}</dt>
                <dd>{t(`vendors.${key}.data`)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase text-muted-foreground">{t("safeguards")}</dt>
                <dd>{t(`vendors.${key}.safeguards`)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
      <p>{t("dpaNote")}</p>
    </>
  );
}
