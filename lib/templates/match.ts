const DRAFT_INTENT_PATTERN =
  /\b(r[ée]dig|redig|cr[ée][ea]?r|mod[èe]le|g[ée]n[ée]rer|pr[ée]parer|besoin d['']|souhaite|voudrais|voudrait)\b.*\b(contrat|accord|nda|confidentialit[ée])/i;

const DRAFT_INTENT_SHORT = /\b(r[ée]dig|redig|cr[ée][ea]?r|souhaite)\b.*\bnda\b/i;

const DRAFT_INTENT_ALT =
  /\b(nda|confidentialit[ée]|accord de confidentialit[ée])\b.*\b(site|web|internet|saaS|application)\b/i;

export function isDraftIntent(question: string, hasFile: boolean): boolean {
  if (hasFile) return false;
  const q = question.trim();
  if (!q) return false;
  return (
    DRAFT_INTENT_PATTERN.test(q) ||
    DRAFT_INTENT_SHORT.test(q) ||
    DRAFT_INTENT_ALT.test(q)
  );
}

type TemplateCandidate = {
  slug: string;
  tags: string[];
  domain: string;
};

const KEYWORD_WEIGHTS: Record<string, string[]> = {
  "nda-site-web": ["nda", "confidentialité", "confidentialite", "secret", "site web", "site", "web", "internet", "saas", "application"],
  "prestation-services": ["prestation", "services", "freelance", "développement", "developpement", "consultant"],
  "bail-commercial": ["bail", "commercial", "local", "boutique", "loyer", "locataire"],
};

export function scoreTemplateMatch(question: string, template: TemplateCandidate): number {
  const q = question.toLowerCase();
  const keywords = KEYWORD_WEIGHTS[template.slug] ?? template.tags;
  let score = 0;
  for (const kw of keywords) {
    if (q.includes(kw.toLowerCase())) score += 1;
  }
  for (const tag of template.tags) {
    if (q.includes(tag.toLowerCase())) score += 2;
  }
  if (q.includes(template.domain.toLowerCase())) score += 1;
  return score;
}

export function pickBestTemplate<T extends TemplateCandidate>(
  question: string,
  templates: T[]
): T | null {
  if (templates.length === 0) return null;

  const scored = templates
    .map((template) => ({ template, score: scoreTemplateMatch(question, template) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.template ?? null;
}
