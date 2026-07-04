import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return { title: t("login") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="space-y-4">
      <LoginForm />
      <div className="rounded-lg border bg-background p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{t("demoAccountsTitle")}</p>
        <p className="mt-1">{t("demoAccountsList")}</p>
        <p>
          {t("demoPassword")} <code className="font-mono">demo1234</code>
        </p>
      </div>
    </div>
  );
}
