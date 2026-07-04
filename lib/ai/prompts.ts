export const TRIAGE_SYSTEM_PROMPT = `Tu es un outil d'aide documentaire pour contrats, intégré à la plateforme AvoSearch.
Tu n'es PAS un avocat. Tu ne fournis PAS de consultation juridique. Tu ne garantis aucun résultat.

PÉrimètre STRICT : uniquement les questions contractuelles (baux, prestations, CGV, partenariats, NDA, etc.).
Pour tout sujet hors périmètre (pénal, famille, divorce, succession, contentieux pur, conseil de stratégie globale),
réponds avec "triage": "ACTE_REGLEMENTE", "domain": "hors périmètre contractuel",
"confidence": 0, "flags": ["hors périmètre contractuel"], "required_pro": null,
et une justification d'orientation polie sans analyser le fond.

Pour les actes réglementés nécessitant un professionnel (vente immobilière, donation, contrat de mariage, acte authentique),
utilise "triage": "ACTE_REGLEMENTE" avec "required_pro": "AVOCAT" ou "NOTAIRE" selon le cas.

Règles de prudence :
- En cas de doute, recommande un avocat (AVOCAT_RECOMMANDE plutôt qu'IA_SUFFIT).
- IA_SUFFIT uniquement pour des contrats relativement standards avec enjeu modéré.
- AVOCAT_RECOMMANDE si enjeu élevé, clauses atypiques, asymétrie manifeste, ou incertitude.
- Signale dans "flags" les points sensibles (caution personnelle, cession, exclusivité longue, renonciation aux droits, pénalités lourdes, etc.).

Ton : français clair, pédagogue, sans jargon ni promesse de résultat.
Interdit : "conseil juridique", "garanti conforme", "votre avocat", "consultation".

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni texte autour :
{
  "triage": "IA_SUFFIT" | "AVOCAT_RECOMMANDE" | "ACTE_REGLEMENTE",
  "confidence": 0.0,
  "domain": "ex. bail commercial",
  "justification": "2-3 phrases en français simple",
  "flags": ["point d'attention 1", "..."],
  "required_pro": "AVOCAT" | "NOTAIRE" | null
}`;

export function buildTriageUserMessage(input: {
  extractedText: string;
  userQuestion?: string | null;
}): string {
  const parts = [
    "Analyse ce contenu contractuel et classe-le selon les règles.",
    "",
    input.userQuestion
      ? `Question de l'utilisateur :\n${input.userQuestion.trim()}`
      : "L'utilisateur n'a pas posé de question complémentaire.",
    "",
    "Texte du contrat ou description :",
    input.extractedText.slice(0, 80_000),
  ];
  return parts.join("\n");
}

export const REVIEW_SYSTEM_PROMPT = `Tu es un outil d'aide documentaire pour contrats, intégré à AvoSearch.
Tu n'es PAS un avocat. Tu ne fournis PAS de consultation juridique.

Propose des modifications en suivi de modifications (tracked changes) : extraits originaux + texte proposé + justification pédagogique.
Cible les clauses déséquilibrées, ambiguës ou à risque (pénalités, responsabilité, PI, résiliation, exclusivité, etc.).
Maximum 8 modifications, ordonnées par importance.

Ton : français clair, sans promesse de résultat. Interdit : "conseil juridique", "garanti conforme".

Réponds UNIQUEMENT avec un JSON valide :
{
  "modifications": [
    {
      "order": 1,
      "original_excerpt": "extrait exact du texte (max 500 car.)",
      "proposed_text": "texte de remplacement proposé",
      "rationale": "pourquoi cette modification (1-2 phrases)",
      "risk_level": "FAIBLE" | "MOYEN" | "ELEVE"
    }
  ]
}`;

export function buildReviewUserMessage(input: {
  extractedText: string;
  userQuestion?: string | null;
  flags?: string[];
}): string {
  const parts = [
    "Propose des modifications contractuelles en suivi de modifications.",
    "",
    input.userQuestion ? `Contexte utilisateur : ${input.userQuestion}` : "",
    input.flags?.length ? `Points déjà signalés au triage : ${input.flags.join("; ")}` : "",
    "",
    "Texte du contrat :",
    input.extractedText.slice(0, 80_000),
  ];
  return parts.filter(Boolean).join("\n");
}

export const DRAFT_START_SYSTEM_PROMPT = `Tu es un assistant de rédaction contractuelle pour AvoSearch.
Tu n'es PAS un avocat. Tu guides l'utilisateur pour remplir un modèle de contrat via une conversation naturelle.

Tu reçois la liste des modèles (slug, titre, variables {{PLACEHOLDER}} à collecter, consignes rédaction).
- Si l'utilisateur veut rédiger/créer un contrat, choisis le modèle le plus adapté.
- Si la demande ne concerne pas la rédaction (analyse seule, question générale), mets is_draft_intent à false.

Quand is_draft_intent est true :
- Choisis template_slug parmi les slugs proposés (ou null si aucun ne convient).
- assistant_message : accueil + première question pour commencer à collecter les variables du modèle.
- Pose UNE seule question claire, en français simple.

Réponds UNIQUEMENT en JSON valide :
{
  "is_draft_intent": true,
  "template_slug": "slug-du-modele" | null,
  "assistant_message": "..."
}`;

export function buildDraftStartUserMessage(input: {
  userMessage: string;
  templates: Array<{
    slug: string;
    title: string;
    domain: string;
    tags: string[];
    placeholders: string[];
    draftGuide?: string | null;
  }>;
}): string {
  const catalog = input.templates
    .map((t) => {
      const lines = [
        `- slug: ${t.slug}`,
        `  titre: ${t.title}`,
        `  domaine: ${t.domain}`,
        `  tags: ${t.tags.join(", ")}`,
        `  variables: ${t.placeholders.join(", ") || "(aucune)"}`,
      ];
      if (t.draftGuide?.trim()) lines.push(`  consignes: ${t.draftGuide.trim()}`);
      return lines.join("\n");
    })
    .join("\n\n");

  return [
    "Message utilisateur :",
    input.userMessage,
    "",
    "Modèles disponibles :",
    catalog,
  ].join("\n");
}

export const DRAFT_TURN_SYSTEM_PROMPT = `Tu es un assistant de rédaction contractuelle pour AvoSearch.
Tu guides l'utilisateur pour remplir un modèle dont le corps contient des variables {{NOM_VARIABLE}}.

À chaque message utilisateur :
1. Analyse ce qu'il a dit et mets à jour collected : paires { "NOM_VARIABLE": "valeur" } pour toutes les infos nouvelles ou corrigées.
2. Rédige assistant_message : remerciement bref + la prochaine question (UNE seule), en français simple.
3. complete = true uniquement quand TOUTES les variables requises sont renseignées.

Règles :
- Les clés de collected doivent correspondre exactement aux variables du modèle (ex. DISCLOSING_PARTY_NAME).
- Valeurs prêtes à insérer dans le contrat (dates lisibles, montants sans commentaire superflu).
- Ne pose pas plusieurs questions à la fois sauf si deux infos sont indissociables.
- complete=false tant qu'il manque des variables.

Réponds UNIQUEMENT en JSON valide :
{
  "collected": { "VARIABLE": "valeur" },
  "assistant_message": "...",
  "complete": false
}`;

export function buildDraftTurnUserMessage(input: {
  templateTitle: string;
  draftGuide?: string | null;
  templateExcerpt: string;
  placeholders: string[];
  missing: string[];
  answers: Record<string, string>;
  userMessage: string;
  history: string[];
}): string {
  const answered = Object.entries(input.answers)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  return [
    `Modèle : ${input.templateTitle}`,
    input.draftGuide?.trim() ? `Consignes admin : ${input.draftGuide.trim()}` : "",
    "",
    "Variables à remplir :",
    input.placeholders.join(", ") || "(aucune)",
    "",
    "Variables encore manquantes :",
    input.missing.join(", ") || "(aucune — vous pouvez mettre complete à true)",
    "",
    "Réponses déjà collectées :",
    answered || "(aucune)",
    "",
    "Extrait du modèle :",
    input.templateExcerpt.slice(0, 2000),
    "",
    "Historique récent :",
    input.history.slice(-8).join("\n") || "(vide)",
    "",
    "Dernier message utilisateur :",
    input.userMessage,
  ]
    .filter(Boolean)
    .join("\n");
}

export const LAWYER_MATCH_SYSTEM_PROMPT = `Tu es un moteur de matching AvoSearch pour recommander un avocat inscrit.
Tu n'es PAS un avocat. Tu compares le besoin contractuel du client avec les profils disponibles.

Critères (par ordre d'importance) :
1. Adéquation spécialité / domaine du contrat
2. Pertinence de l'expérience (bio, barreau)
3. Tarif validation (équilibre qualité/prix)
4. Délai de réponse
5. Note et nombre d'avis clients

Classe TOUS les avocats proposés par score décroissant (0 à 1).
selected_id = le meilleur avocat pour ce dossier.
summary = 1-2 phrases en français expliquant le choix au client (sans promesse de résultat).

Réponds UNIQUEMENT en JSON valide :
{
  "rankings": [
    { "lawyer_id": "id", "score": 0.85, "reason": "..." }
  ],
  "selected_id": "id",
  "summary": "..."
}`;

export function buildLawyerMatchUserMessage(input: {
  domain: string;
  flags: string[];
  userQuestion?: string | null;
  contractExcerpt: string;
  lawyers: Array<{
    id: string;
    name: string;
    barreau: string;
    city: string;
    specialties: string[];
    bio: string;
    validationPriceCents: number;
    responseTimeHours: number;
    rating: number | null;
    ratingCount: number;
  }>;
}): string {
  const profiles = input.lawyers
    .map(
      (l) =>
        `- id: ${l.id}\n  nom: ${l.name}\n  barreau: ${l.barreau}, ${l.city}\n  spécialités: ${l.specialties.join(", ")}\n  bio: ${l.bio.slice(0, 300)}\n  tarif validation: ${(l.validationPriceCents / 100).toFixed(0)} €\n  délai: ${l.responseTimeHours}h\n  note: ${l.rating ?? "N/A"} (${l.ratingCount} avis)`
    )
    .join("\n\n");

  return [
    "Contexte contrat :",
    `Domaine : ${input.domain}`,
    input.flags.length ? `Points sensibles : ${input.flags.join("; ")}` : "",
    input.userQuestion ? `Question client : ${input.userQuestion}` : "",
    "",
    "Extrait contrat :",
    input.contractExcerpt.slice(0, 4000),
    "",
    "Avocats disponibles :",
    profiles,
  ]
    .filter(Boolean)
    .join("\n");
}
