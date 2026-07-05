import { prisma } from "@/lib/db";
import { llmScoreMap, runBarristerMatchWithLlm } from "@/lib/ai/barrister-match";
import { contractMatchingContext } from "@/lib/contracts/document";

export type BarristerSelectionBreakdown = {
  specialty: number;
  price: number;
  reactivity: number;
  review: number;
  total: number;
};

export type RankedBarrister = {
  profile: Awaited<ReturnType<typeof fetchEligibleBarristers>>[number];
  breakdown: BarristerSelectionBreakdown;
  llmReason?: string;
  matchSummary?: string;
  matchModel?: string;
};

export type SelectedBarrister = RankedBarrister;

const WEIGHTS = {
  specialty: 0.35,
  price: 0.20,
  reactivity: 0.20,
  review: 0.25,
} as const;

async function fetchEligibleBarristers() {
  return prisma.barristerProfile.findMany({
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

export function scoreBarristerProfile(
  profile: Awaited<ReturnType<typeof fetchEligibleBarristers>>[number],
  haystack: string,
  allProfiles: Awaited<ReturnType<typeof fetchEligibleBarristers>>
): BarristerSelectionBreakdown {
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
  barristers: Awaited<ReturnType<typeof fetchEligibleBarristers>>,
  haystack: string
): RankedBarrister[] {
  return barristers
    .map((profile) => ({
      profile,
      breakdown: scoreBarristerProfile(profile, haystack, barristers),
    }))
    .sort((a, b) => b.breakdown.total - a.breakdown.total);
}

export async function rankBarristersForContract(contractId: string, limit = 5): Promise<RankedBarrister[]> {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: { analysis: true, template: { select: { domain: true } } },
  });

  if (!contract) return [];

  const contextText = contractMatchingContext(contract);
  if (!contextText) return [];

  const barristers = await fetchEligibleBarristers();
  if (barristers.length === 0) return [];

  const domain = contract.analysis?.domain ?? contract.template?.domain ?? contract.title;
  const flags = contract.analysis?.flags ?? [];
  const haystack = buildHaystack(domain, flags, contextText);

  const llmMatch = await runBarristerMatchWithLlm({
    domain,
    flags,
    userQuestion: contract.userQuestion,
    contractExcerpt: contextText,
    barristers,
  });

  if (llmMatch) {
    const byId = new Map(barristers.map((l) => [l.userId, l]));
    const scores = llmScoreMap(llmMatch.result);
    const ranked: RankedBarrister[] = [];

    for (const entry of llmMatch.result.rankings) {
      const profile = byId.get(entry.barrister_id);
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

    for (const profile of barristers) {
      if (scores.has(profile.userId)) continue;
      ranked.push({
        profile,
        breakdown: scoreBarristerProfile(profile, haystack, barristers),
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

  console.warn("[barrister-match] Using heuristic ranking (LLM unavailable)");
  return rankHeuristic(barristers, haystack).slice(0, limit);
}

export async function selectBestBarristerForContract(contractId: string): Promise<SelectedBarrister | null> {
  const ranked = await rankBarristersForContract(contractId, 1);
  return ranked[0] ?? null;
}

export { WEIGHTS as BARRISTER_SELECTION_WEIGHTS };
