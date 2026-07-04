import { RequiredPro, TriageResult } from "@prisma/client";
import { anthropic, assertAnthropicConfigured, MODEL } from "./client";
import { applyTriageGuardrails } from "./guardrails";
import { buildTriageUserMessage, TRIAGE_SYSTEM_PROMPT } from "./prompts";
import { prisma } from "@/lib/db";
import { triageAiResponseSchema, type TriageAiResponse } from "@/lib/validation/triage";

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model response.");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

async function callTriageModel(input: {
  extractedText: string;
  userQuestion?: string | null;
}): Promise<TriageAiResponse> {
  assertAnthropicConfigured();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: TRIAGE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildTriageUserMessage(input),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Empty model response.");
  }

  return triageAiResponseSchema.parse(extractJsonObject(textBlock.text));
}

async function callTriageWithRetry(input: {
  extractedText: string;
  userQuestion?: string | null;
}): Promise<TriageAiResponse> {
  try {
    return await callTriageModel(input);
  } catch (firstError) {
    console.warn("[triage] First attempt failed, retrying once:", firstError);
    return await callTriageModel(input);
  }
}

function toRequiredPro(value: TriageAiResponse["required_pro"]): RequiredPro | null {
  if (value === "AVOCAT") return RequiredPro.AVOCAT;
  if (value === "NOTAIRE") return RequiredPro.NOTAIRE;
  return null;
}

export async function analyzeContract(contractId: string) {
  const contract = await prisma.contract.findUniqueOrThrow({
    where: { id: contractId },
    include: { analysis: true },
  });

  if (contract.analysis) {
    return contract.analysis;
  }

  const raw = await callTriageWithRetry({
    extractedText: contract.extractedText,
    userQuestion: contract.userQuestion,
  });

  const guarded = applyTriageGuardrails(raw);

  return prisma.analysis.create({
    data: {
      contractId: contract.id,
      triage: guarded.triage as TriageResult,
      confidence: guarded.confidence,
      domain: guarded.domain,
      justification: guarded.justification,
      flags: guarded.flags,
      requiredPro: toRequiredPro(guarded.required_pro),
      model: MODEL,
    },
  });
}

export type TriageAnalysis = Awaited<ReturnType<typeof analyzeContract>>;
