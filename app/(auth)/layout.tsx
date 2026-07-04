import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-brand-surface px-4 py-12">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>
      <Link href="/" className="mb-10 shrink-0">
        <Logo className="h-9" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-10 max-w-sm text-center text-xs leading-relaxed text-muted-foreground/80">
        {dict.auth.demoNote}
      </p>
    </div>
  );
}
