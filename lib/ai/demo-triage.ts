import type { TriageResponse } from "@/lib/validation/triage";

const OUT_OF_SCOPE_PATTERN =
  /p[ée]nal|divorce|succession|garde d'enfant|custody|criminal|family law/i;

const HIGH_STAKES_PATTERN =
  /caution personnelle|cession|exclusivit[ée]|renonciation|propri[ée]t[ée] intellectuelle|responsabilit[ée].*plafonn|p[ée]nalit[ée]/i;

const REGULATED_ACT_PATTERN =
  /vente immobili[èe]re|donation|contrat de mariage|acte authentique|notaire obligatoire/i;

export function runDemoTriage(input: {
  extractedText: string;
  userQuestion?: string | null;
}): TriageResponse {
  const combined = `${input.userQuestion ?? ""}\n${input.extractedText}`.toLowerCase();

  if (OUT_OF_SCOPE_PATTERN.test(combined)) {
    return {
      triage: "ACTE_REGLEMENTE",
      confidence: 0,
      domain: "hors périmètre contractuel",
      justification:
        "Ce sujet sort du périmètre contractuel d'AvoSearch. Consultez directement un avocat spécialisé dans le domaine concerné.",
      flags: ["hors périmètre contractuel"],
      required_pro: "AVOCAT",
    };
  }

  if (REGULATED_ACT_PATTERN.test(combined)) {
    return {
      triage: "ACTE_REGLEMENTE",
      confidence: 0.9,
      domain: "acte réglementé",
      justification:
        "Ce type d'acte requiert généralement l'intervention d'un professionnel réglementé (avocat ou notaire). AvoSearch vous oriente sans analyser le fond en mode automatisé.",
      flags: ["acte nécessitant un professionnel réglementé"],
      required_pro: /notaire|acte authentique|donation|mariage/i.test(combined)
        ? "NOTAIRE"
        : "AVOCAT",
    };
  }

  const flags: string[] = [];
  if (/d[ée]p[ôo]t de garantie.*6|six \(6\) mois/i.test(combined)) {
    flags.push("dépôt de garantie élevé (6 mois)");
  }
  if (/renonciation.*r[ée]siliation triennale/i.test(combined)) {
    flags.push("renonciation à la résiliation triennale");
  }
  if (/cession.*agrement|agrement.*cession/i.test(combined)) {
    flags.push("cession soumise à agrément");
  }
  if (/propri[ée]t[ée].*prestataire|prestataire.*propri[ée]t[ée]/i.test(combined)) {
    flags.push("propriété intellectuelle conservée par le prestataire");
  }
  if (/responsabilit[ée].*10 %|plafonn[ée].*10/i.test(combined)) {
    flags.push("plafond de responsabilité très bas");
  }
  if (/p[ée]nalit[ée].*15 %|15 %.*retard/i.test(combined)) {
    flags.push("pénalités de retard élevées");
  }
  if (/non-sollicitation|non concurrence/i.test(combined)) {
    flags.push("clause de non-sollicitation ou non-concurrence");
  }

  const highStakes = HIGH_STAKES_PATTERN.test(combined) || flags.length >= 3;

  if (highStakes) {
    return {
      triage: "AVOCAT_RECOMMANDE",
      confidence: 0.85,
      domain: detectDomain(combined),
      justification:
        "Plusieurs clauses méritent attention et l'enjeu du contrat justifie l'accompagnement d'un avocat pour renégocier ou sécuriser vos intérêts.",
      flags: flags.length > 0 ? flags : ["clauses déséquilibrées ou atypiques"],
      required_pro: "AVOCAT",
    };
  }

  return {
    triage: "IA_SUFFIT",
    confidence: 0.78,
    domain: detectDomain(combined),
    justification:
      "Il s'agit d'un contrat relativement standard. Des ajustements ciblés peuvent être proposés en suivi de modifications, sous réserve de votre situation.",
    flags: flags.length > 0 ? flags : ["quelques points à vérifier"],
    required_pro: null,
  };
}

function detectDomain(text: string): string {
  if (/bail|locataire|preneur|loyer/i.test(text)) return "bail commercial";
  if (/prestation|prestataire|d[ée]veloppement|services/i.test(text)) {
    return "prestation de services";
  }
  if (/cgv|conditions g[ée]n[ée]rales/i.test(text)) return "conditions générales de vente";
  if (/partenariat|nda|confidentialit[ée]/i.test(text)) return "contrat de partenariat";
  return "contrat";
}
