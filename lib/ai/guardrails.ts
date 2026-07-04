import type { RequiredPro, TriageResult } from "@prisma/client";
import type { TriageResponse } from "@/lib/validation/triage";

const OUT_OF_SCOPE_PATTERN =
  /hors\s*p[ée]rim[èe]tre|p[ée]nal|famille|divorce|succession|contentieux/i;

const HIGH_STAKES_KEYWORDS = [
  "caution personnelle",
  "cession",
  "exclusivité",
  "renonciation",
  "garantie solidaire",
  "clause pénale",
  "indemnisation illimitée",
  "responsabilité illimitée",
  "pénalité",
  "non-concurrence",
  "non-sollicitation",
  "asymétri",
  "dépôt de garantie",
  "clause résolutoire",
];

export type GuardedTriage = {
  outOfScope: boolean;
  triage: TriageResult;
  confidence: number;
  domain: string;
  justification: string;
  flags: string[];
  requiredPro: RequiredPro | null;
  guardrailNotes: string[];
};

function isOutOfScope(response: TriageResponse): boolean {
  if (OUT_OF_SCOPE_PATTERN.test(response.domain)) return true;
  return response.flags.some((flag) => OUT_OF_SCOPE_PATTERN.test(flag));
}

function hasHighStakes(flags: string[]): boolean {
  const joined = flags.join(" ").toLowerCase();
  return HIGH_STAKES_KEYWORDS.some((keyword) => joined.includes(keyword));
}

export function applyTriageGuardrails(response: TriageResponse): GuardedTriage {
  const guardrailNotes: string[] = [];

  if (isOutOfScope(response)) {
    return {
      outOfScope: true,
      triage: "ACTE_REGLEMENTE",
      confidence: 0,
      domain: response.domain,
      justification: response.justification,
      flags: response.flags,
      requiredPro: response.required_pro === "NOTAIRE" ? "NOTAIRE" : "AVOCAT",
      guardrailNotes: ["out_of_scope"],
    };
  }

  let triage: TriageResult = response.triage;
  const confidence = response.confidence;

  if (confidence < 0.7 && triage === "IA_SUFFIT") {
    triage = "AVOCAT_RECOMMANDE";
    guardrailNotes.push("confidence_below_threshold");
  }

  if (hasHighStakes(response.flags) && triage === "IA_SUFFIT") {
    triage = "AVOCAT_RECOMMANDE";
    guardrailNotes.push("high_stakes_flags");
  }

  return {
    outOfScope: false,
    triage,
    confidence,
    domain: response.domain,
    justification: response.justification,
    flags: response.flags,
    requiredPro: response.required_pro,
    guardrailNotes,
  };
}
