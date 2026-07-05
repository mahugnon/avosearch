import type { TriageResponse } from "@/lib/validation/triage";

const OUT_OF_SCOPE_PATTERN =
  /p[ée]nal|divorce|succession|garde d'enfant|custody|criminal|family law/i;

const HIGH_STAKES_PATTERN =
  /caution personnelle|personal guarantee|cession|exclusivit[ée]|exclusivity|renonciation|waiver|propri[ée]t[ée] intellectuelle|intellectual property|responsabilit[ée].*plafonn|liability.*cap|p[ée]nalit[ée]|penalt/i;

const REGULATED_ACT_PATTERN =
  /vente immobili[èe]re|real estate sale|donation|contrat de mariage|marriage contract|acte authentique|notaire obligatoire|notary required/i;

export function runDemoTriage(input: {
  extractedText: string;
  userQuestion?: string | null;
}): TriageResponse {
  const combined = `${input.userQuestion ?? ""}\n${input.extractedText}`.toLowerCase();

  if (OUT_OF_SCOPE_PATTERN.test(combined)) {
    return {
      triage: "ACTE_REGLEMENTE",
      confidence: 0,
      domain: "outside contract scope",
      justification:
        "This topic is outside AvoSearch's contract scope. Please consult a specialized barrister directly.",
      flags: ["outside contract scope"],
      required_pro: "AVOCAT",
    };
  }

  if (REGULATED_ACT_PATTERN.test(combined)) {
    return {
      triage: "ACTE_REGLEMENTE",
      confidence: 0.9,
      domain: "regulated act",
      justification:
        "This type of act generally requires a regulated professional (barrister or notary). AvoSearch will guide you without automated substantive analysis.",
      flags: ["act requiring a regulated professional"],
      required_pro: /notaire|notary|acte authentique|donation|mariage|marriage/i.test(combined)
        ? "NOTAIRE"
        : "AVOCAT",
    };
  }

  const flags: string[] = [];
  if (/d[ée]p[ôo]t de garantie.*6|security deposit.*6|six \(6\) months/i.test(combined)) {
    flags.push("high security deposit (6 months)");
  }
  if (/renonciation.*r[ée]siliation triennale|waiver.*triennial|triennial termination/i.test(combined)) {
    flags.push("waiver of triennial termination");
  }
  if (/cession.*agrement|agrement.*cession|assignment.*consent|consent.*assignment/i.test(combined)) {
    flags.push("assignment subject to approval");
  }
  if (/propri[ée]t[ée].*prestataire|prestataire.*propri[ée]t[ée]|provider.*intellectual|intellectual.*provider/i.test(combined)) {
    flags.push("intellectual property retained by provider");
  }
  if (/responsabilit[ée].*10 %|plafonn[ée].*10|liability.*10 %|capped at 10/i.test(combined)) {
    flags.push("very low liability cap");
  }
  if (/p[ée]nalit[ée].*15 %|15 %.*retard|penalty.*15 %|15 %.*late/i.test(combined)) {
    flags.push("high late payment penalties");
  }
  if (/non-sollicitation|non concurrence|non-solicitation|non-compete/i.test(combined)) {
    flags.push("non-solicitation or non-compete clause");
  }

  const highStakes = HIGH_STAKES_PATTERN.test(combined) || flags.length >= 3;

  if (highStakes) {
    return {
      triage: "AVOCAT_RECOMMANDE",
      confidence: 0.85,
      domain: detectDomain(combined),
      justification:
        "Several clauses deserve attention and the contract stakes justify barrister support to renegotiate or protect your interests.",
      flags: flags.length > 0 ? flags : ["unbalanced or atypical clauses"],
      required_pro: "AVOCAT",
    };
  }

  return {
    triage: "IA_SUFFIT",
    confidence: 0.78,
    domain: detectDomain(combined),
    justification:
      "This is a relatively standard contract. Targeted adjustments may be proposed in follow-up modifications, depending on your situation.",
    flags: flags.length > 0 ? flags : ["a few points to verify"],
    required_pro: null,
  };
}

function detectDomain(text: string): string {
  if (/bail|locataire|preneur|loyer|commercial lease|landlord|tenant|rent/i.test(text)) {
    return "commercial lease";
  }
  if (/prestation|prestataire|d[ée]veloppement|services agreement|provider|freelance/i.test(text)) {
    return "services agreement";
  }
  if (/cgv|conditions g[ée]n[ée]rales|terms of sale/i.test(text)) return "terms of sale";
  if (/partenariat|partnership|nda|confidentialit[ée]|confidentiality/i.test(text)) {
    return "partnership agreement";
  }
  return "contract";
}
