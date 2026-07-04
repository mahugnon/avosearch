import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export async function SiteFooter() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <footer className="border-t border-white/10 bg-brand-ink text-gray-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <Logo variant="markDark" className="h-9 w-9" />
              <span className="text-lg font-semibold tracking-tight text-white">AvoSearch</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">{dict.footer.description}</p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-gray-400">
            <Link href="/legal/cgu" className="transition-colors hover:text-white">
              {dict.footer.cgu}
            </Link>
            <Link href="/legal/mentions-legales" className="transition-colors hover:text-white">
              {dict.footer.legal}
            </Link>
            <Link href="/legal/confidentialite" className="transition-colors hover:text-white">
              {dict.footer.privacy}
            </Link>
          </nav>
        </div>
        <p className="text-xs text-gray-500">{dict.footer.demoNote}</p>
      </div>
    </footer>
  );
}
