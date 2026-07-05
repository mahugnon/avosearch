import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterBarristerForm } from "@/components/auth/register-barrister-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("registerBarrister") };
}

export default function RegisterBarristerPage() {
  return <RegisterBarristerForm />;
}
