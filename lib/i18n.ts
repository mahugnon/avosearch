import { routing } from "@/i18n/routing";

export type AppLocale = (typeof routing.locales)[number];

const INTL_LOCALE: Record<AppLocale, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

export function getLocaleFromPath(path: string): AppLocale {
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return routing.defaultLocale;
}

export function stripLocalePrefix(path: string): string {
  if (path.startsWith("/en/")) return path.slice(3) || "/";
  if (path === "/en") return "/";
  return path;
}

export function localizedPath(path: string, locale: AppLocale): string {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}

export function intlLocale(locale: AppLocale): string {
  return INTL_LOCALE[locale];
}
