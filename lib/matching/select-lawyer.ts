import { prisma } from "@/lib/db";
import { llmScoreMap, runLawyerMatchWithLlm } from "@/lib/ai/lawyer-match";

export type LawyerSelectionBreakdown = {
  specialty: number;
  price: number;
  reactivity: number;
  review: number;
  total: number;
};

export type RankedLawyer = {
  profile: Awaited<ReturnType<typeof fetchEligibleLawyers>>[number];
  breakdown: LawyerSelectionBreakdown;
  llmReason?: string;
  matchSummary?: string;
  matchModel?: string;
};

export type SelectedLawyer = RankedLawyer;

const WEIGHTS = {
  specialty: 0.35,
  price: 0.20,
  reactivity: 0.20,
  review: 0.25,
} as const;

async function fetchEligibleLawyers() {
  return prisma.lawyerProfile.findMany({
    where: { verified: true, available: true },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

function buildHaystack(domain: string, flags: string[], extractedText: string): string {
  return `${domain} ${flags.join(" ")} ${extractedText.slice(0, 2000)}`.toLowerCase();
}

function specialtyScore(specialties: string[], haystack: string): number {
  if (specialties.length === 0) return 0;
  let hits = 0;
  for (const specialty of specialties) {
    const tokens = specialty.toLowerCase().split(/[\s,/]+/).filter((t) => t.length > 3);
    if (tokens.some((token) => haystack.includes(token))) hits += 1;
  }
  if (/bail|commercial|loyer/i.test(haystack) && /bail|commercial/i.test(specialties.join(" "))) {
    hits += 1;
  }
  if (/prestation|services|freelance/i.test(haystack) && /prestation|commercial|numérique|numerique/i.test(specialties.join(" "))) {
    hits += 1;
  }
  if (/nda|confidentialit/i.test(haystack) && /commercial|numérique|numerique|propriété|propriete/i.test(specialties.join(" "))) {
    hits += 1;
  }
  return Math.min(1, hits / Math.max(1, specialties.length));
}

function normalizeInverse(values: number[], value: number): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 1;
  return (max - value) / (max - min);
}

function reviewScore(rating: number | null, ratingCount: number): number {
  if (rating == null || ratingCount === 0) return 0.5;
  return Math.min(1, rating / 5);
}

export function scoreLawyerProfile(
  profile: Awaited<ReturnType<typeof fetchEligibleLawyers>>[number],
  haystack: string,
  allProfiles: Awaited<ReturnType<typeof fetchEligibleLawyers>>
): LawyerSelectionBreakdown {
  const specialty = specialtyScore(profile.specialties, haystack);
  const prices = allProfiles.map((p) => p.validationPriceCents);
  const responseTimes = allProfiles.map((p) => p.responseTimeHours);
  const price = normalizeInverse(prices, profile.validationPriceCents);
  const reactivity = normalizeInverse(responseTimes, profile.responseTimeHours);
  const review = reviewScore(profile.rating, profile.ratingCount);
  const total =
    specialty * WEIGHTS.specialty +
    price * WEIGHTS.price +
    reactivity * WEIGHTS.reactivity +
    review * WEIGHTS.review;

  return {
    specialty: Math.round(specialty * 100) / 100,
    price: Math.round(price * 100) / 100,
    reactivity: Math.round(reactivity * 100) / 100,
    review: Math.round(review * 100) / 100,
    total: Math.round(total * 1000) / 1000,
  };
}

function rankHeuristic(
  lawyers: Awaited<ReturnType<typeof fetchEligibleLawyers>>,
  haystack: string
): RankedLawyer[] {
  return lawyers
    .map((profile) => ({
      profile,
      breakdown: scoreLawyerProfile(profile, haystack, lawyers),
    }))
    .sort((a, b) => b.breakdown.total - a.breakdown.total);
}

export async function rankLawyersForContract(contractId: string, limit = 5): Promise<RankedLawyer[]> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { analysis: true },
  });

  if (!contract?.analysis) return [];

  const lawyers = await fetchEligibleLawyers();
  if (lawyers.length === 0) return [];

  const haystack = buildHaystack(
    contract.analysis.domain,
    contract.analysis.flags,
    contract.extractedText
  );

  const llmMatch = await runLawyerMatchWithLlm({
    domain: contract.analysis.domain,
    flags: contract.analysis.flags,
    userQuestion: contract.userQuestion,
    contractExcerpt: contract.extractedText,
    lawyers,
  });

  if (llmMatch) {
    const byId = new Map(lawyers.map((l) => [l.userId, l]));
    const scores = llmScoreMap(llmMatch.result);
    const ranked: RankedLawyer[] = [];

    for (const entry of llmMatch.result.rankings) {
      const profile = byId.get(entry.lawyer_id);
      if (!profile) continue;
      ranked.push({
        profile,
        breakdown: {
          specialty: entry.score,
          price: entry.score,
          reactivity: entry.score,
          review: entry.score,
          total: entry.score,
        },
        llmReason: entry.reason,
        matchSummary: llmMatch.result.summary,
        matchModel: llmMatch.model,
      });
    }

    for (const profile of lawyers) {
      if (scores.has(profile.userId)) continue;
      ranked.push({
        profile,
        breakdown: scoreLawyerProfile(profile, haystack, lawyers),
        matchModel: "heuristic-fallback",
      });
    }

    const selectedIdx = ranked.findIndex((r) => r.profile.userId === llmMatch.result.selected_id);
    if (selectedIdx > 0) {
      const [selected] = ranked.splice(selectedIdx, 1);
      ranked.unshift(selected);
    }

    return ranked.slice(0, limit);
  }

  console.warn("[lawyer-match] Using heuristic ranking (LLM unavailable)");
  return rankHeuristic(lawyers, haystack).slice(0, limit);
}

export async function selectBestLawyerForContract(contractId: string): Promise<SelectedLawyer | null> {
  const ranked = await rankLawyersForContract(contractId, 1);
  return ranked[0] ?? null;
}

export { WEIGHTS as LAWYER_SELECTION_WEIGHTS };
