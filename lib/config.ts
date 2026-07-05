// Default pricing, configurable via env. All amounts in cents, TTC.

import type { AppLocale } from "@/lib/i18n";
import { intlLocale } from "@/lib/i18n";

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

// Three-tier offer (see landing "Three tiers"). All amounts in cents, TTC.
const basicCents = intFromEnv("PRICE_BASIC_CENTS", 8900);
const expressCents = intFromEnv("PRICE_EXPRESS_CENTS", 14900);
const complexMinCents = intFromEnv("PRICE_COMPLEX_MIN_CENTS", 29000);
const complexMaxCents = intFromEnv("PRICE_COMPLEX_MAX_CENTS", 59000);

export const pricing = {
  /** Basic — simple agreements, 72 working hours */
  basicCents,
  basicHours: intFromEnv("PRICE_BASIC_HOURS", 72),
  /** Express — priority handling, 24 working hours */
  expressCents,
  expressHours: intFromEnv("PRICE_EXPRESS_HOURS", 24),
  /** Complex — higher-stakes matters, indicative range */
  complexMinCents,
  complexMaxCents,

  // Aliases kept for the review/matching flow, aligned to the tier offer.
  aiOnlyCents: intFromEnv("PRICE_AI_ONLY_CENTS", 1900),
  aiPlusBarristerCents: basicCents,
  missionMinCents: complexMinCents,
  missionMaxCents: complexMaxCents,
};

export function formatEuros(cents: number, locale: AppLocale = "fr"): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
