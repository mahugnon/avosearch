import { runDemoTriage } from "@/lib/ai/demo-triage";
import { applyTriageGuardrails, type GuardedTriage } from "@/lib/ai/guardrails";
import {
  callLlmChat,
  isAiConfigured,
  isLlmAuthError,
} from "@/lib/ai/llm";
import { buildTriageUserMessage, TRIAGE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { isZodParseError, parseTriageJson } from "@/lib/validation/triage";

export class TriageError extends Error {
  constructor(
    message: string,
    readonly code: "AI_NOT_CONFIGURED" | "AI_FAILED" | "PARSE_FAILED"
  ) {
    super(message);
    this.name = "TriageError";
  }
}

const DEMO_MODEL = "demo-heuristic";

async function callTriageModel(input: {
  extractedText: string;
  userQuestion?: string | null;
}): Promise<{ text: string; model: string }> {
  const { text, model } = await callLlmChat({
    system: TRIAGE_SYSTEM_PROMPT,
    user: buildTriageUserMessage(input),
    maxTokens: 1024,
  });
  return { text, model };
}

function runDemo(input: {
  extractedText: string;
  userQuestion?: string | null;
}): { result: GuardedTriage; model: string } {
  console.warn("[triage] Using demo heuristic (no LLM API key configured)");
  const parsed = runDemoTriage(input);
  return { result: applyTriageGuardrails(parsed), model: DEMO_MODEL };
}

export async function runContractTriage(input: {
  extractedText: string;
  userQuestion?: string | null;
}): Promise<{ result: GuardedTriage; model: string }> {
  if (!isAiConfigured()) {
    return runDemo(input);
  }

  let lastError: unknown;
  let lastRaw: string | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text, model } = await callTriageModel(input);
      lastRaw = text;
      const parsed = parseTriageJson(text);
      const result = applyTriageGuardrails(parsed);
      console.log("[triage] decision", {
        model,
        triage: result.triage,
        confidence: result.confidence,
        outOfScope: result.outOfScope,
        guardrailNotes: result.guardrailNotes,
      });
      return { result, model };
    } catch (error) {
      lastError = error;
      if (isZodParseError(error)) {
        console.error("[triage] JSON parse failed", {
          attempt: attempt + 1,
          raw: lastRaw,
          error: error instanceof Error ? error.message : error,
        });
      }
      if (isLlmAuthError(error)) {
        console.warn("[triage] Invalid LLM API key — falling back to demo mode");
        return runDemo(input);
      }
    }
  }

  if (isZodParseError(lastError)) {
    throw new TriageError("Failed to parse AI triage JSON", "PARSE_FAILED");
  }
  throw new TriageError(
    lastError instanceof Error ? lastError.message : "AI triage failed",
    "AI_FAILED"
  );
}
