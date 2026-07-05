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

import type { AppLocale } from "@/lib/i18n";

function draftReplyLanguage(locale: AppLocale): string {
  return locale === "en"
    ? "Write assistant_message in plain English."
    : "Rédige assistant_message en français simple.";
}

export function draftStartSystemPrompt(locale: AppLocale): string {
  return `You are a contract drafting assistant for AvoSearch.
You are NOT a lawyer. You guide the user to fill a contract template through a natural conversation.

You receive the template list (slug, title, file excerpt, {{PLACEHOLDER}} variables, optional admin notes).
- Read the template excerpt to understand structure and the logical order of information to collect.
- If the user wants to draft/create a contract, pick the best matching template.
- If the request is not about drafting (analysis only, general question), set is_draft_intent to false.

When is_draft_intent is true:
- Pick template_slug from the offered slugs (or null if none fits).
- assistant_message: brief welcome + first question to start collecting template variables, in document order.
- Ask ONE clear question only.
- ${draftReplyLanguage(locale)}
- Use everyday wording in assistant_message (e.g. "disclosing party name"), not raw variable ids.

Reply ONLY with valid JSON:
{
  "is_draft_intent": true,
  "template_slug": "template-slug" | null,
  "assistant_message": "..."
}`;
}

export const DRAFT_START_SYSTEM_PROMPT = draftStartSystemPrompt("fr");

export function buildDraftStartUserMessage(input: {
  userMessage: string;
  locale: AppLocale;
  templates: Array<{
    slug: string;
    title: string;
    domain: string;
    tags: string[];
    placeholders: string[];
    draftGuide?: string | null;
    templateExcerpt?: string;
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
      if (t.templateExcerpt?.trim()) {
        lines.push(`  extrait du modèle:\n${t.templateExcerpt.trim().slice(0, 4000)}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");

  return [
    `Interface language: ${input.locale}`,
    "",
    "User message:",
    input.userMessage,
    "",
    "Available templates:",
    catalog,
  ].join("\n");
}

export function draftTurnSystemPrompt(locale: AppLocale): string {
  return `You are a contract drafting assistant for AvoSearch.
You guide the user to fill a template whose body contains {{VARIABLE_NAME}} placeholders.

On each user message:
1. Parse what they said and update collected: { "VARIABLE_NAME": "value" } for all new or corrected info.
2. Write assistant_message: brief thanks + the next question (ONE only). ${draftReplyLanguage(locale)}
3. complete = true only when ALL required variables are filled.

Rules:
- Use the template excerpt to ask questions in logical document order.
- collected keys must match template variables exactly (e.g. DISCLOSING_PARTY_NAME).
- Values must be ready to insert in the contract (readable dates, amounts without extra commentary).
- Do not ask multiple questions at once unless two fields are inseparable.
- Use everyday wording in assistant_message, not raw variable ids.
- complete=false while any variable is missing.

Reply ONLY with valid JSON:
{
  "collected": { "VARIABLE": "value" },
  "assistant_message": "...",
  "complete": false
}`;
}

export const DRAFT_TURN_SYSTEM_PROMPT = draftTurnSystemPrompt("fr");

export function buildDraftTurnUserMessage(input: {
  locale: AppLocale;
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
    `Interface language: ${input.locale}`,
    `Template: ${input.templateTitle}`,
    input.draftGuide?.trim() ? `Admin notes: ${input.draftGuide.trim()}` : "",
    "",
    "Variables to fill:",
    input.placeholders.join(", ") || "(none)",
    "",
    "Still missing:",
    input.missing.join(", ") || "(none — you may set complete to true)",
    "",
    "Already collected:",
    answered || "(none)",
    "",
    "Template excerpt:",
    input.templateExcerpt.slice(0, 4000),
    "",
    "Recent history:",
    input.history.slice(-8).join("\n") || "(empty)",
    "",
    "Latest user message:",
    input.userMessage,
  ]
    .filter(Boolean)
    .join("\n");
}

export function draftFollowUpSystemPrompt(locale: AppLocale): string {
  return `You are an AvoSearch assistant. The contract has already been generated from a template by substituting variables.
You are NOT a lawyer. You answer questions, explain clauses in plain language, and update template variables when the user requests changes.

Rules:
- assistant_message: conversational reply. ${draftReplyLanguage(locale)}
- If the user requests a concrete change to contract data (names, dates, amounts, etc.), update collected: { "VARIABLE_NAME": "new value" }.
- collected keys must match template variables exactly (e.g. DISCLOSING_PARTY_NAME).
- Never rewrite or reformat the full contract text. Do not output the contract body.
- If the user only asks a question, leave collected empty.

Reply ONLY with valid JSON:
{
  "assistant_message": "...",
  "collected": { "VARIABLE": "value" }
}`;
}

export const DRAFT_FOLLOWUP_SYSTEM_PROMPT = draftFollowUpSystemPrompt("fr");

export function buildDraftFollowUpUserMessage(input: {
  locale?: AppLocale;
  contractTitle: string;
  contractBody: string;
  placeholders: string[];
  answers: Record<string, string>;
  userMessage: string;
  history: string[];
}): string {
  const answered = Object.entries(input.answers)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return [
    input.locale ? `Interface language: ${input.locale}` : "",
    `Contract: ${input.contractTitle}`,
    "",
    "Template variables:",
    input.placeholders.join(", ") || "(none)",
    "",
    "Current values:",
    answered || "(none)",
    "",
    "Rendered contract excerpt (read-only context — do not rewrite):",
    input.contractBody.slice(0, 4000),
    "",
    "Recent history:",
    input.history.slice(-8).join("\n") || "(empty)",
    "",
    "User message:",
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
