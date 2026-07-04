import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/dictionaries/en";
import { fr } from "@/lib/i18n/dictionaries/fr";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
