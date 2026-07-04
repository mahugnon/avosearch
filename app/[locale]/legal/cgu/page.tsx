import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

const SECTION_KEYS = ["1", "2", "3", "4", "5"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("cgu") };
}

export default async function CguPage() {
  const t = await getTranslations("legal.cgu");

  return (
    <>
      <h1>{t("title")}</h1>
      {SECTION_KEYS.map((key) => (
        <section key={key}>
          <h2>{t(`sections.${key}.title`)}</h2>
          <p>{t(`sections.${key}.body`)}</p>
        </section>
      ))}
    </>
  );
}
