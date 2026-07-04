import {
  buildLawyerMatchUserMessage,
  LAWYER_MATCH_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import { callLlmChat, isAiConfigured, isLlmAuthError } from "@/lib/ai/llm";
import {
  isLawyerMatchParseError,
  parseLawyerMatchJson,
  type LawyerMatchResponse,
} from "@/lib/validation/lawyer-match";

export type LawyerProfileForMatch = {
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

export async function runLawyerMatchWithLlm(input: {
  domain: string;
  flags: string[];
  userQuestion?: string | null;
  contractExcerpt: string;
  lawyers: LawyerProfileForMatch[];
}): Promise<{ result: LawyerMatchResponse; model: string } | null> {
  if (!isAiConfigured() || input.lawyers.length === 0) return null;

  try {
    const { text, model } = await callLlmChat({
      system: LAWYER_MATCH_SYSTEM_PROMPT,
      user: buildLawyerMatchUserMessage({
        domain: input.domain,
        flags: input.flags,
        userQuestion: input.userQuestion,
        contractExcerpt: input.contractExcerpt,
        lawyers: input.lawyers.map((l) => ({
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

    const result = parseLawyerMatchJson(text);
    const validIds = new Set(input.lawyers.map((l) => l.userId));
    const rankings = result.rankings.filter((r) => validIds.has(r.lawyer_id));

    if (rankings.length === 0 || !validIds.has(result.selected_id)) {
      console.warn("[lawyer-match] LLM returned invalid lawyer ids");
      return null;
    }

    console.log("[lawyer-match] parsed", {
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
      console.warn("[lawyer-match] LLM auth error");
    } else if (!isLawyerMatchParseError(error)) {
      console.error("[lawyer-match] failed", error);
    }
    return null;
  }
}

export function llmScoreMap(result: LawyerMatchResponse): Map<string, { score: number; reason: string }> {
  return new Map(result.rankings.map((r) => [r.lawyer_id, { score: r.score, reason: r.reason }]));
}
