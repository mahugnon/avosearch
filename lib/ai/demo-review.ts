import type { ReviewModification, ReviewResponse } from "@/lib/validation/review";

function excerptAround(text: string, pattern: RegExp, radius = 120): string | null {
  const match = pattern.exec(text);
  if (!match || match.index === undefined) return null;
  const start = Math.max(0, match.index - radius);
  const end = Math.min(text.length, match.index + match[0].length + radius);
  return text.slice(start, end).trim();
}

export function runDemoReview(extractedText: string): ReviewResponse {
  const mods: ReviewModification[] = [];
  let order = 1;

  const rules: Array<{
    pattern: RegExp;
    proposed: string;
    rationale: string;
    risk: ReviewModification["risk_level"];
  }> = [
    {
      pattern: /six \(6\) mois de loyer/i,
      proposed: "trois (3) mois de loyer hors taxes",
      rationale:
        "Un dépôt de garantie de 6 mois est élevé pour un bail commercial. Une réduction à 3 mois est souvent négociable.",
      risk: "MOYEN",
    },
    {
      pattern: /renonce express[ée]ment à sa faculté de résiliation triennale/i,
      proposed: "conserve sa faculté de résiliation triennale conformément à la loi",
      rationale:
        "La renonciation à la résiliation triennale prive le locataire d'une sortie anticipée — point sensible à négocier.",
      risk: "ELEVE",
    },
    {
      pattern: /sous-location.*strictement interdite/i,
      proposed:
        "la sous-location est soumise à l'accord écrit préalable du Bailleur, qui ne pourra le refuser que pour un motif légitime",
      rationale: "Une interdiction absolue de sous-location limite fortement la flexibilité du Preneur.",
      risk: "MOYEN",
    },
    {
      pattern: /responsabilit[ée].*plafonn[ée]e à 10 %/i,
      proposed: "responsabilité plafonnée au montant total des sommes effectivement versées par le Client",
      rationale: "Un plafond à 10 % des sommes versées est très favorable au prestataire.",
      risk: "ELEVE",
    },
    {
      pattern: /propri[ée]t[ée] exclusive du Prestataire/i,
      proposed:
        "le Client devient propriétaire des livrables après paiement intégral, sous réserve des composants open source",
      rationale: "La rétention de la propriété intellectuelle par le prestataire peut bloquer l'exploitation du site.",
      risk: "ELEVE",
    },
    {
      pattern: /15 % du montant total.*par mois de retard/i,
      proposed: "des pénalités de retard au taux légal majoré, sans pouvoir excéder 10 % du montant impayé",
      rationale: "Une pénalité de 15 % par mois est disproportionnée.",
      risk: "MOYEN",
    },
    {
      pattern: /ne pourra divulguer.*sans accord écrit préalable/i,
      proposed:
        "ne divulguera les informations confidentielles qu'aux personnes ayant besoin d'en connaître, sous obligation de confidentialité",
      rationale: "Préciser les exceptions usuels (obligation légale, conseils) renforce l'équilibre du NDA.",
      risk: "FAIBLE",
    },
  ];

  for (const rule of rules) {
    const excerpt = excerptAround(extractedText, rule.pattern);
    if (!excerpt) continue;
    mods.push({
      order: order++,
      original_excerpt: excerpt,
      proposed_text: rule.proposed,
      rationale: rule.rationale,
      risk_level: rule.risk,
    });
  }

  if (mods.length === 0) {
    const sample = extractedText.slice(0, 400).trim() || "Document contractuel";
    mods.push({
      order: 1,
      original_excerpt: sample,
      proposed_text:
        "Les parties conviennent que les clauses générales seront relues pour vérifier l'équilibre des obligations réciproques.",
      rationale:
        "Aucune clause à risque évident détectée automatiquement. Une relecture humaine reste recommandée avant signature.",
      risk_level: "FAIBLE",
    });
  }

  return { modifications: mods.slice(0, 8) };
}
