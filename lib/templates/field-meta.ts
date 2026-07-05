// Human-friendly questions, hints and (where the answer is a fixed choice)
// radio options for each template placeholder. Keeps the chat flow clear —
// especially for the NDA example — instead of showing raw snake_case keys.

export type FieldInputType = "text" | "radio";

export type FieldOption = { value: string; label: string };

type LocalizedText = { fr: string; en: string };

type FieldMetaEntry = {
  type: FieldInputType;
  question: LocalizedText;
  hint?: LocalizedText;
  /** For radio fields: stable `value` (written into the contract) + localized label. */
  options?: Array<{ value: string; label: LocalizedText }>;
};

export type ResolvedFieldMeta = {
  label: string;
  hint?: string;
  type: FieldInputType;
  options?: FieldOption[];
};

const FIELD_META: Record<string, FieldMetaEntry> = {
  // ---- Party A ----
  PARTY_A_NAME: {
    type: "text",
    question: {
      fr: "Quelle est la dénomination sociale de la première partie ?",
      en: "What is the legal name of the first party?",
    },
    hint: { fr: "Ex. : TechVision SAS", en: "e.g. TechVision SAS" },
  },
  PARTY_A_ADDRESS: {
    type: "text",
    question: {
      fr: "Quelle est l'adresse du siège social de la première partie ?",
      en: "What is the registered address of the first party?",
    },
    hint: { fr: "Ex. : 12 rue de Rivoli, 75001 Paris", en: "e.g. 12 rue de Rivoli, 75001 Paris" },
  },
  PARTY_A_CAPITAL: {
    type: "text",
    question: {
      fr: "Quel est le capital social de la première partie ?",
      en: "What is the share capital of the first party?",
    },
    hint: { fr: "Ex. : 50 000 €", en: "e.g. €50,000" },
  },
  PARTY_A_RCS_CITY: {
    type: "text",
    question: {
      fr: "Dans quelle ville la première partie est-elle immatriculée (RCS) ?",
      en: "In which city is the first party registered (trade register)?",
    },
    hint: { fr: "Ex. : Paris", en: "e.g. Paris" },
  },
  PARTY_A_RCS_NUMBER: {
    type: "text",
    question: {
      fr: "Quel est le numéro RCS / SIREN de la première partie ?",
      en: "What is the registration number of the first party?",
    },
    hint: { fr: "Ex. : 812 345 678", en: "e.g. 812 345 678" },
  },
  PARTY_A_REPRESENTATIVE: {
    type: "text",
    question: {
      fr: "Qui signe pour la première partie (nom et fonction) ?",
      en: "Who signs for the first party (name and role)?",
    },
    hint: { fr: "Ex. : Camille Martin, Présidente", en: "e.g. Camille Martin, CEO" },
  },
  // ---- Party B ----
  PARTY_B_NAME: {
    type: "text",
    question: {
      fr: "Quelle est la dénomination sociale de la seconde partie ?",
      en: "What is the legal name of the second party?",
    },
    hint: { fr: "Ex. : Innovate Lab SARL", en: "e.g. Innovate Lab SARL" },
  },
  PARTY_B_ADDRESS: {
    type: "text",
    question: {
      fr: "Quelle est l'adresse du siège social de la seconde partie ?",
      en: "What is the registered address of the second party?",
    },
    hint: { fr: "Ex. : 8 quai Perrache, 69002 Lyon", en: "e.g. 8 quai Perrache, 69002 Lyon" },
  },
  PARTY_B_CAPITAL: {
    type: "text",
    question: {
      fr: "Quel est le capital social de la seconde partie ?",
      en: "What is the share capital of the second party?",
    },
    hint: { fr: "Ex. : 10 000 €", en: "e.g. €10,000" },
  },
  PARTY_B_RCS_CITY: {
    type: "text",
    question: {
      fr: "Dans quelle ville la seconde partie est-elle immatriculée (RCS) ?",
      en: "In which city is the second party registered (trade register)?",
    },
    hint: { fr: "Ex. : Lyon", en: "e.g. Lyon" },
  },
  PARTY_B_RCS_NUMBER: {
    type: "text",
    question: {
      fr: "Quel est le numéro RCS / SIREN de la seconde partie ?",
      en: "What is the registration number of the second party?",
    },
    hint: { fr: "Ex. : 902 111 222", en: "e.g. 902 111 222" },
  },
  PARTY_B_REPRESENTATIVE: {
    type: "text",
    question: {
      fr: "Qui signe pour la seconde partie (nom et fonction) ?",
      en: "Who signs for the second party (name and role)?",
    },
    hint: { fr: "Ex. : Jules Bernard, Gérant", en: "e.g. Jules Bernard, Managing Director" },
  },
  // ---- Subject ----
  PROJECT_DESCRIPTION: {
    type: "text",
    question: {
      fr: "Sur quel projet ou échange les parties collaborent-elles ?",
      en: "What project or exchange are the parties collaborating on?",
    },
    hint: {
      fr: "Ex. : un partenariat commercial autour d'une nouvelle application",
      en: "e.g. a commercial partnership around a new app",
    },
  },
  // ---- Confidentiality terms (radio) ----
  CONFIDENTIALITY_YEARS: {
    type: "radio",
    question: {
      fr: "Combien de temps les informations doivent-elles rester confidentielles ?",
      en: "How long must the information stay confidential?",
    },
    options: [
      { value: "2", label: { fr: "2 ans", en: "2 years" } },
      { value: "3", label: { fr: "3 ans", en: "3 years" } },
      { value: "5", label: { fr: "5 ans", en: "5 years" } },
    ],
  },
  AGREEMENT_DURATION: {
    type: "radio",
    question: {
      fr: "Quelle est la durée de l'accord de confidentialité ?",
      en: "How long is the confidentiality agreement in force?",
    },
    options: [
      { value: "1 year", label: { fr: "1 an", en: "1 year" } },
      { value: "2 years", label: { fr: "2 ans", en: "2 years" } },
      { value: "3 years", label: { fr: "3 ans", en: "3 years" } },
      { value: "5 years", label: { fr: "5 ans", en: "5 years" } },
    ],
  },
  TERMINATION_NOTICE: {
    type: "radio",
    question: {
      fr: "Quel préavis faut-il pour résilier l'accord ?",
      en: "How much notice is needed to terminate the agreement?",
    },
    options: [
      { value: "30 days", label: { fr: "30 jours", en: "30 jours" } },
      { value: "60 days", label: { fr: "60 jours", en: "60 jours" } },
      { value: "90 days", label: { fr: "90 jours", en: "90 jours" } },
    ],
  },
};

type Locale = "fr" | "en";

function humanize(key: string): string {
  return key.toLowerCase().split("_").join(" ");
}

/** Resolve a placeholder key + locale into a display-ready field descriptor. */
export function resolveFieldMeta(key: string, locale: Locale): ResolvedFieldMeta {
  const entry = FIELD_META[key];
  if (!entry) {
    return { label: humanize(key), type: "text" };
  }
  return {
    label: entry.question[locale],
    hint: entry.hint?.[locale],
    type: entry.type,
    options: entry.options?.map((o) => ({ value: o.value, label: o.label[locale] })),
  };
}
