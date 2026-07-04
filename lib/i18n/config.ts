export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const LOCALE_COOKIE = "avosearch-locale";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function dateLocale(locale: Locale): string {
  return locale === "fr" ? "fr-FR" : "en-GB";
}
