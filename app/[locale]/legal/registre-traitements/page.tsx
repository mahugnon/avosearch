import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

const ROW_KEYS = ["1", "2", "3", "4", "5", "6"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("registreTraitements") };
}

export default async function RegistreTraitementsPage() {
  const t = await getTranslations("legal.register");

  return (
    <>
      <h1>{t("title")}</h1>
      <p className="text-xs">{t("lastUpdated")}</p>
      <p>{t("intro")}</p>
      <section>
        <h2>{t("tableTitle")}</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 font-medium text-foreground">{t("columns.purpose")}</th>
                <th className="p-3 font-medium text-foreground">{t("columns.data")}</th>
                <th className="p-3 font-medium text-foreground">{t("columns.legalBasis")}</th>
                <th className="p-3 font-medium text-foreground">{t("columns.retention")}</th>
              </tr>
            </thead>
            <tbody>
              {ROW_KEYS.map((key) => (
                <tr key={key} className="border-t">
                  <td className="p-3 align-top">{t(`rows.${key}.purpose`)}</td>
                  <td className="p-3 align-top">{t(`rows.${key}.data`)}</td>
                  <td className="p-3 align-top">{t(`rows.${key}.legalBasis`)}</td>
                  <td className="p-3 align-top">{t(`rows.${key}.retention`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p>
        {t("subprocessorsHint")}{" "}
        <Link href="/legal/sous-traitants" className="underline underline-offset-2">
          {t("subprocessorsLink")}
        </Link>
      </p>
    </>
  );
}
