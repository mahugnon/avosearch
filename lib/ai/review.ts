import { runDemoReview } from "@/lib/ai/demo-review";
import { callLlmChat, isAiConfigured, isLlmAuthError } from "@/lib/ai/llm";
import { buildReviewUserMessage, REVIEW_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { isZodReviewParseError, parseReviewJson, type ReviewResponse } from "@/lib/validation/review";

export class ReviewError extends Error {
  constructor(
    message: string,
    readonly code: "AI_NOT_CONFIGURED" | "AI_FAILED" | "PARSE_FAILED" | "NO_CONSENT"
  ) {
    super(message);
    this.name = "ReviewError";
  }
}

const DEMO_MODEL = "demo-heuristic";

export async function runContractReview(input: {
  extractedText: string;
  userQuestion?: string | null;
  flags?: string[];
}): Promise<{ result: ReviewResponse; model: string }> {
  if (!isAiConfigured()) {
    console.warn("[review] Using demo heuristic");
    return { result: runDemoReview(input.extractedText), model: DEMO_MODEL };
  }

  let lastError: unknown;
  let lastRaw: string | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text, model } = await callLlmChat({
        system: REVIEW_SYSTEM_PROMPT,
        user: buildReviewUserMessage(input),
        maxTokens: 4096,
      });
      lastRaw = text;
      const result = parseReviewJson(text);
      console.log("[review] parsed", { model, count: result.modifications.length });
      return { result, model };
    } catch (error) {
      lastError = error;
      if (isLlmAuthError(error)) {
        return { result: runDemoReview(input.extractedText), model: DEMO_MODEL };
      }
    }
  }

  if (isZodReviewParseError(lastError)) {
    console.error("[review] parse failed", lastRaw);
    return { result: runDemoReview(input.extractedText), model: DEMO_MODEL };
  }

  throw new ReviewError(
    lastError instanceof Error ? lastError.message : "Review failed",
    "AI_FAILED"
  );
}
