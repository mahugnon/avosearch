// Preset answers per template, used to pre-fill the client drafting flow during
// a live demo. Keyed by template slug → placeholder key → value. Values are
// intentionally fictional (see the seed's "demo identities" convention).

const DEMO_PRESETS: Record<string, Record<string, string>> = {
  "nda-bilateral": {
    PARTY_A_NAME: "TechVision SAS",
    PARTY_A_CAPITAL: "50000",
    PARTY_A_ADDRESS: "12 rue de Rivoli, 75001 Paris",
    PARTY_A_RCS_CITY: "Paris",
    PARTY_A_RCS_NUMBER: "812 345 678",
    PARTY_A_REPRESENTATIVE: "Camille Martin, Présidente",
    PARTY_B_NAME: "Innovate Lab SARL",
    PARTY_B_CAPITAL: "10000",
    PARTY_B_ADDRESS: "8 quai Perrache, 69002 Lyon",
    PARTY_B_RCS_CITY: "Lyon",
    PARTY_B_RCS_NUMBER: "902 111 222",
    PARTY_B_REPRESENTATIVE: "Jules Bernard, Gérant",
    PROJECT_DESCRIPTION: "un partenariat commercial autour d'une nouvelle application mobile",
    CONFIDENTIALITY_YEARS: "3",
    AGREEMENT_DURATION: "3 years",
    TERMINATION_NOTICE: "60 days",
  },
  "nda-site-web": {
    PARTY_A_NAME: "TechVision SAS",
    PARTY_A_ADDRESS: "12 rue de Rivoli, 75001 Paris",
    PARTY_A_REPRESENTATIVE: "Camille Martin, Présidente",
    PARTY_B_NAME: "Studio Démo SARL",
    PARTY_B_ADDRESS: "8 quai Perrache, 69002 Lyon",
    PARTY_B_REPRESENTATIVE: "Jules Bernard, Gérant",
    PROJECT_DESCRIPTION: "la refonte d'un site e-commerce",
    CONFIDENTIALITY_YEARS: "2",
  },
  "prestation-services": {
    PARTY_A_NAME: "Studio Démo Web SASU",
    PARTY_A_ADDRESS: "8 quai Perrache, 69002 Lyon",
    PARTY_A_REPRESENTATIVE: "Jules Bernard, Gérant",
    PARTY_B_NAME: "Client Exemple SARL",
    PARTY_B_ADDRESS: "12 rue de Rivoli, 75001 Paris",
    PARTY_B_REPRESENTATIVE: "Camille Martin, Présidente",
    PROJECT_DESCRIPTION: "la conception d'un site internet de commerce électronique",
  },
};

export function getDemoPresets(slug: string | null | undefined): Record<string, string> {
  if (!slug) return {};
  return DEMO_PRESETS[slug] ?? {};
}

export function getDemoValue(slug: string | null | undefined, key: string): string | undefined {
  if (!slug) return undefined;
  return DEMO_PRESETS[slug]?.[key];
}
