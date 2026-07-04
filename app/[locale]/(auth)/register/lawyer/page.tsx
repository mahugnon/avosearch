import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterLawyerForm } from "@/components/auth/register-lawyer-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("registerLawyer") };
}

export default function RegisterLawyerPage() {
  return <RegisterLawyerForm />;
}
