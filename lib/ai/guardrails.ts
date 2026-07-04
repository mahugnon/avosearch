import type { TriageAiResponse } from "@/lib/validation/triage";
import { OUT_OF_SCOPE_JUSTIFICATION } from "./prompts";

const HIGH_STAKES_KEYWORDS = [
  "cession",
  "caution personnelle",
  "caution solidaire",
  "exclusivité",
  "non-concurrence",
  "non-concurrence",
  "garantie solidaire",
  "renonciation",
  "pénalité",
  "clause pénale",
  "indemnisation illimitée",
  "responsabilité illimitée",
  "cautionnement",
  "nantissement",
  "fusion",
  "acquisition",
  "levée de fonds",
];

export function flagIndicatesHighStakes(flags: string[]): boolean {
  const combined = flags.join(" ").toLowerCase();
  return HIGH_STAKES_KEYWORDS.some((keyword) => combined.includes(keyword));
}

export function applyTriageGuardrails(raw: TriageAiResponse): TriageAiResponse {
  if (!raw.in_scope) {
    return {
      triage: "ACTE_REGLEMENTE",
      confidence: 1,
      domain: "hors périmètre",
      justification: OUT_OF_SCOPE_JUSTIFICATION,
      flags: [],
      required_pro: "AVOCAT",
      in_scope: false,
    };
  }

  let triage = raw.triage;
  const flags = [...raw.flags];

  if (raw.confidence < 0.7 && triage === "IA_SUFFIT") {
    triage = "AVOCAT_RECOMMANDE";
    if (!flags.some((f) => f.toLowerCase().includes("confiance"))) {
      flags.push("Niveau de confiance insuffisant pour une relecture automatisée seule");
    }
  }

  if (triage === "IA_SUFFIT" && flagIndicatesHighStakes(flags)) {
    triage = "AVOCAT_RECOMMANDE";
    if (!flags.some((f) => f.toLowerCase().includes("enjeu"))) {
      flags.push("Enjeu élevé détecté — recommandation avocat par prudence");
    }
  }

  return { ...raw, triage, flags };
}

export function isOutOfScope(analysis: { domain: string; flags: string[] }): boolean {
  return (
    analysis.domain.toLowerCase() === "hors périmètre" ||
    analysis.flags.some((f) => f === "__OUT_OF_SCOPE__")
  );
}
