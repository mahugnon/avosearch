// Default pricing, configurable via env. All amounts in cents, TTC.

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const pricing = {
  /** "IA seule" formula — per contract */
  aiOnlyCents: intFromEnv("PRICE_AI_ONLY_CENTS", 1900),
  /** "IA + validation avocat" formula — per contract, 24h turnaround */
  aiPlusLawyerCents: intFromEnv("PRICE_AI_LAWYER_CENTS", 7900),
  /** Flat-fee lawyer missions — indicative range */
  missionMinCents: intFromEnv("PRICE_MISSION_MIN_CENTS", 15000),
  missionMaxCents: intFromEnv("PRICE_MISSION_MAX_CENTS", 50000),
};

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
