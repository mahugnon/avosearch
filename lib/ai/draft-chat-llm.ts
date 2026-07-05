import type { AppLocale } from "@/lib/i18n";
import {
  buildDraftFollowUpUserMessage,
  buildDraftStartUserMessage,
  buildDraftTurnUserMessage,
  draftFollowUpSystemPrompt,
  draftStartSystemPrompt,
  draftTurnSystemPrompt,
} from "@/lib/ai/prompts";
import { callLlmChat, isAiConfigured, isLlmAuthError } from "@/lib/ai/llm";
import {
  isDraftChatParseError,
  parseDraftFollowUpJson,
  parseDraftStartJson,
  parseDraftTurnJson,
  type DraftFollowUpResponse,
  type DraftStartResponse,
  type DraftTurnResponse,
} from "@/lib/validation/draft-chat";

export async function runDraftStartWithLlm(input: {
  locale: AppLocale;
  userMessage: string;
  templates: Array<{
    slug: string;
    title: string;
    domain: string;
    tags: string[];
    placeholders: string[];
    draftGuide?: string | null;
    templateExcerpt?: string;
  }>;
}): Promise<{ result: DraftStartResponse; model: string } | null> {
  if (!isAiConfigured()) return null;

  try {
    const { text, model } = await callLlmChat({
      system: draftStartSystemPrompt(input.locale),
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
  locale: AppLocale;
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
      system: draftTurnSystemPrompt(input.locale),
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

export async function runDraftFollowUpWithLlm(input: {
  locale: AppLocale;
  contractTitle: string;
  contractBody: string;
  placeholders: string[];
  answers: Record<string, string>;
  userMessage: string;
  history: string[];
}): Promise<{ result: DraftFollowUpResponse; model: string } | null> {
  if (!isAiConfigured()) return null;

  try {
    const { text, model } = await callLlmChat({
      system: draftFollowUpSystemPrompt(input.locale),
      user: buildDraftFollowUpUserMessage(input),
      maxTokens: 4096,
    });
    const result = parseDraftFollowUpJson(text);
    console.log("[draft-chat] follow-up", {
      model,
      collectedKeys: Object.keys(result.collected ?? {}),
    });
    return { result, model };
  } catch (error) {
    if (isLlmAuthError(error)) {
      console.warn("[draft-chat] LLM auth error on follow-up");
    } else if (!isDraftChatParseError(error)) {
      console.error("[draft-chat] follow-up failed", error);
    }
    return null;
  }
}
