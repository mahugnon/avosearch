const PLACEHOLDER_PATTERN = /(\.\.\.|change-me|your-key|xxx|placeholder)/i;

export const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1";

export const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3-nano-30b-a3b";

function isValidKey(key: string | undefined, prefix: string): boolean {
  if (!key?.trim()) return false;
  if (PLACEHOLDER_PATTERN.test(key)) return false;
  return key.startsWith(prefix);
}

export function isNvidiaConfigured(): boolean {
  return isValidKey(process.env.NVIDIA_API_KEY, "nvapi-");
}

export function isAiConfigured(): boolean {
  return isNvidiaConfigured();
}

export function isLlmAuthError(error: unknown): boolean {
  if (error instanceof LlmRequestError) {
    return error.status === 401 || error.status === 403;
  }
  return false;
}

export class LlmRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "LlmRequestError";
  }
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callNvidiaChat(messages: ChatMessage[], maxTokens: number): Promise<string> {
  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.2,
      top_p: 0.9,
    }),
  });

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    error?: { message?: string };
  };

  if (!response.ok) {
    console.error("[llm] NVIDIA error", {
      status: response.status,
      model: NVIDIA_MODEL,
      error: payload.error?.message ?? payload,
    });
    throw new LlmRequestError(
      payload.error?.message ?? `NVIDIA API error (${response.status})`,
      response.status
    );
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    console.error("[llm] Empty NVIDIA response", { model: NVIDIA_MODEL, payload });
    throw new LlmRequestError("Empty NVIDIA response", 502);
  }

  // Never log the content itself: it derives from user contracts
  console.log("[llm] response", { model: NVIDIA_MODEL, usage: payload.usage });

  return content;
}

export async function callLlmChat(input: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<{ text: string; model: string }> {
  return callLlmChatMessages({
    messages: [
      { role: "system", content: input.system },
      { role: "user", content: input.user },
    ],
    maxTokens: input.maxTokens,
  });
}

export async function callLlmChatMessages(input: {
  messages: ChatMessage[];
  maxTokens?: number;
}): Promise<{ text: string; model: string }> {
  if (!isNvidiaConfigured()) {
    throw new LlmRequestError("NVIDIA_API_KEY is not configured", 503);
  }

  const text = await callNvidiaChat(input.messages, input.maxTokens ?? 1024);
  return { text, model: NVIDIA_MODEL };
}
