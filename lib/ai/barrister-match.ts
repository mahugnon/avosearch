import {
  buildBarristerMatchUserMessage,
  BARRISTER_MATCH_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import { callLlmChat, isAiConfigured, isLlmAuthError } from "@/lib/ai/llm";
import {
  isBarristerMatchParseError,
  parseBarristerMatchJson,
  type BarristerMatchResponse,
} from "@/lib/validation/barrister-match";

export type BarristerProfileForMatch = {
  userId: string;
  user: { name: string };
  barreau: string;
  city: string;
  specialties: string[];
  bio: string;
  validationPriceCents: number;
  responseTimeHours: number;
  rating: number | null;
  ratingCount: number;
};

export async function runBarristerMatchWithLlm(input: {
  domain: string;
  flags: string[];
  userQuestion?: string | null;
  contractExcerpt: string;
  barristers: BarristerProfileForMatch[];
}): Promise<{ result: BarristerMatchResponse; model: string } | null> {
  if (!isAiConfigured() || input.barristers.length === 0) return null;

  try {
    const { text, model } = await callLlmChat({
      system: BARRISTER_MATCH_SYSTEM_PROMPT,
      user: buildBarristerMatchUserMessage({
        domain: input.domain,
        flags: input.flags,
        userQuestion: input.userQuestion,
        contractExcerpt: input.contractExcerpt,
        barristers: input.barristers.map((l) => ({
          id: l.userId,
          name: l.user.name,
          barreau: l.barreau,
          city: l.city,
          specialties: l.specialties,
          bio: l.bio,
          validationPriceCents: l.validationPriceCents,
          responseTimeHours: l.responseTimeHours,
          rating: l.rating,
          ratingCount: l.ratingCount,
        })),
      }),
      maxTokens: 2048,
    });

    const result = parseBarristerMatchJson(text);
    const validIds = new Set(input.barristers.map((l) => l.userId));
    const rankings = result.rankings.filter((r) => validIds.has(r.barrister_id));

    if (rankings.length === 0 || !validIds.has(result.selected_id)) {
      console.warn("[barrister-match] LLM returned invalid barrister ids");
      return null;
    }

    console.log("[barrister-match] parsed", {
      model,
      selectedId: result.selected_id,
      count: rankings.length,
    });

    return {
      result: { ...result, rankings },
      model,
    };
  } catch (error) {
    if (isLlmAuthError(error)) {
      console.warn("[barrister-match] LLM auth error");
    } else if (!isBarristerMatchParseError(error)) {
      console.error("[barrister-match] failed", error);
    }
    return null;
  }
}

export function llmScoreMap(result: BarristerMatchResponse): Map<string, { score: number; reason: string }> {
  return new Map(result.rankings.map((r) => [r.barrister_id, { score: r.score, reason: r.reason }]));
}
