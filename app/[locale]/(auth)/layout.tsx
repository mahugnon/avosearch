import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth");

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-brand-surface px-4 py-12">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LocaleSwitcher />
      </div>
      <Link href="/" className="mb-10 shrink-0">
        <Logo className="h-9" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-10 max-w-sm text-center text-xs leading-relaxed text-muted-foreground/80">
        {t("layoutDisclaimer")}
      </p>
    </div>
  );
}
