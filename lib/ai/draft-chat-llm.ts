import {
  buildDraftStartUserMessage,
  buildDraftTurnUserMessage,
  DRAFT_START_SYSTEM_PROMPT,
  DRAFT_TURN_SYSTEM_PROMPT,
} from "@/lib/ai/prompts";
import { callLlmChat, isAiConfigured, isLlmAuthError } from "@/lib/ai/llm";
import {
  isDraftChatParseError,
  parseDraftStartJson,
  parseDraftTurnJson,
  type DraftStartResponse,
  type DraftTurnResponse,
} from "@/lib/validation/draft-chat";

export async function runDraftStartWithLlm(input: {
  userMessage: string;
  templates: Array<{
    slug: string;
    title: string;
    domain: string;
    tags: string[];
    placeholders: string[];
    draftGuide?: string | null;
  }>;
}): Promise<{ result: DraftStartResponse; model: string } | null> {
  if (!isAiConfigured()) return null;

  try {
    const { text, model } = await callLlmChat({
      system: DRAFT_START_SYSTEM_PROMPT,
      user: buildDraftStartUserMessage(input),
      maxTokens: 1024,
    });
    const result = parseDraftStartJson(text);
    console.log("[draft-chat] start", { model, templateSlug: result.template_slug });
    return { result, model };
  } catch (error) {
    if (isLlmAuthError(error)) {
      console.warn("[draft-chat] LLM auth error on start");
    } else if (!isDraftChatParseError(error)) {
      console.error("[draft-chat] start failed", error);
    }
    return null;
  }
}

export async function runDraftTurnWithLlm(input: {
  templateTitle: string;
  draftGuide?: string | null;
  templateExcerpt: string;
  placeholders: string[];
  missing: string[];
  answers: Record<string, string>;
  userMessage: string;
  history: string[];
}): Promise<{ result: DraftTurnResponse; model: string } | null> {
  if (!isAiConfigured()) return null;

  try {
    const { text, model } = await callLlmChat({
      system: DRAFT_TURN_SYSTEM_PROMPT,
      user: buildDraftTurnUserMessage(input),
      maxTokens: 1536,
    });
    const result = parseDraftTurnJson(text);
    console.log("[draft-chat] turn", {
      model,
      complete: result.complete,
      collectedKeys: Object.keys(result.collected),
    });
    return { result, model };
  } catch (error) {
    if (isLlmAuthError(error)) {
      console.warn("[draft-chat] LLM auth error on turn");
    } else if (!isDraftChatParseError(error)) {
      console.error("[draft-chat] turn failed", error);
    }
    return null;
  }
}
