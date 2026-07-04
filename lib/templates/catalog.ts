import type { TemplateStep } from "@/lib/templates/types";

export const NDA_SITE_WEB_BODY = `ACCORD DE CONFIDENTIALITÉ (NDA)

Entre :
{{DISCLOSING_PARTY_NAME}}, {{DISCLOSING_PARTY_FORM}}, dont le siège est situé {{DISCLOSING_PARTY_ADDRESS}}, ci-après « la Partie divulgatrice »,

Et :
{{RECIPIENT_NAME}}, ci-après « la Partie destinataire »,

Il a été convenu ce qui suit :

Article 1 — Objet
La Partie divulgatrice communique à la Partie destinataire des informations confidentielles dans le cadre du site web {{WEBSITE_URL}} et de ses activités associées.

Article 2 — Informations confidentielles
Sont réputées confidentielles toutes informations techniques, commerciales, financières ou stratégiques communiquées par écrit, oralement ou par tout autre moyen, identifiées comme telles ou raisonnablement considérées comme confidentielles.

Article 3 — Obligations
La Partie destinataire s'engage à :
- ne pas divulguer les informations confidentielles à des tiers sans accord écrit préalable ;
- n'utiliser les informations qu'aux fins prévues par le présent accord ;
- protéger les informations avec le même degré de diligence qu'elle accorde à ses propres informations sensibles.

Article 4 — Durée
Le présent accord entre en vigueur le {{EFFECTIVE_DATE}} et demeure applicable pendant {{DURATION_YEARS}} an(s).

Article 5 — Restitution
À la demande de la Partie divulgatrice, la Partie destinataire restitue ou détruit l'ensemble des documents et supports contenant des informations confidentielles.

Article 6 — Absence de garantie
Les informations sont fournies « en l'état », sans garantie d'aucune sorte.

Article 7 — Droit applicable
Le présent accord est soumis au droit français.

Fait en deux exemplaires originaux.

---

Document généré via un modèle AvoSearch — aide documentaire, ne constitue pas une consultation juridique.`;

export const NDA_SITE_WEB_STEPS: TemplateStep[] = [
  {
    title: "Votre entreprise",
    fields: [
      {
        id: "DISCLOSING_PARTY_NAME",
        label: "Nom de votre entreprise ou votre nom",
        chatPrompt: "Quel est le nom de votre entreprise (ou votre nom si vous êtes indépendant) ?",
        placeholder: "SARL Exemple Web",
        type: "text",
        required: true,
      },
    ],
  },
  {
    title: "Forme juridique",
    fields: [
      {
        id: "DISCLOSING_PARTY_FORM",
        label: "Forme juridique",
        chatPrompt: "Quelle est votre forme juridique ? (SAS, SARL, EI, auto-entrepreneur…)",
        placeholder: "SAS",
        type: "text",
        required: true,
      },
    ],
  },
  {
    title: "Adresse",
    fields: [
      {
        id: "DISCLOSING_PARTY_ADDRESS",
        label: "Adresse du siège social",
        chatPrompt: "Quelle est l'adresse de votre siège social ?",
        placeholder: "12 rue de la Paix, 75002 Paris",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Destinataire",
    fields: [
      {
        id: "RECIPIENT_NAME",
        label: "Nom du destinataire",
        chatPrompt: "Qui recevra les informations confidentielles ? (nom de l'entreprise ou du prestataire)",
        placeholder: "Agence Partenaire SAS",
        type: "text",
        required: true,
      },
    ],
  },
  {
    title: "Site web concerné",
    fields: [
      {
        id: "WEBSITE_URL",
        label: "URL du site web",
        chatPrompt: "Quelle est l'URL du site web concerné ?",
        placeholder: "https://www.mon-site.fr",
        type: "text",
        required: true,
      },
    ],
  },
  {
    title: "Durée",
    fields: [
      {
        id: "DURATION_YEARS",
        label: "Durée (en années)",
        chatPrompt: "Pendant combien d'années les informations doivent-elles rester confidentielles ? (3 ans est courant — répondez « 3 » si cela vous convient)",
        placeholder: "3",
        type: "number",
        required: false,
      },
      {
        id: "EFFECTIVE_DATE",
        label: "Date de prise d'effet",
        type: "date",
        required: false,
      },
    ],
  },
];

export const PRESTATION_BODY = `CONTRAT DE PRESTATION DE SERVICES

Entre :
{{CLIENT_NAME}}, ci-après « le Client »,

Et :
{{PROVIDER_NAME}}, ci-après « le Prestataire »,

Article 1 — Objet
Le Prestataire réalise pour le Client la prestation suivante : {{SERVICE_DESCRIPTION}}.

Article 2 — Durée
Le contrat prend effet le {{EFFECTIVE_DATE}} pour une durée de {{DURATION_MONTHS}} mois.

Article 3 — Prix
Le prix forfaitaire est fixé à {{PRICE_EUR}} € HT, payable {{PAYMENT_TERMS}}.

Article 4 — Propriété intellectuelle
{{IP_CLAUSE}}

Article 5 — Confidentialité
Les parties s'engagent à garder confidentielles les informations échangées.

Document généré via un modèle AvoSearch — aide documentaire, ne constitue pas une consultation juridique.`;

export const PRESTATION_STEPS: TemplateStep[] = [
  {
    title: "Le Client",
    fields: [{ id: "CLIENT_NAME", label: "Nom du Client", type: "text", required: true }],
  },
  {
    title: "Le Prestataire",
    fields: [{ id: "PROVIDER_NAME", label: "Nom du Prestataire", type: "text", required: true }],
  },
  {
    title: "Description de la prestation",
    fields: [
      {
        id: "SERVICE_DESCRIPTION",
        label: "Que doit réaliser le prestataire ?",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    title: "Calendrier",
    fields: [
      { id: "EFFECTIVE_DATE", label: "Date de début", type: "date", required: true },
      { id: "DURATION_MONTHS", label: "Durée (mois)", type: "number", required: true },
    ],
  },
  {
    title: "Conditions financières",
    fields: [
      { id: "PRICE_EUR", label: "Prix forfaitaire (€ HT)", type: "number", required: true },
      {
        id: "PAYMENT_TERMS",
        label: "Modalités de paiement",
        placeholder: "50 % à la commande, 50 % à la livraison",
        type: "text",
        required: true,
      },
    ],
  },
  {
    title: "Propriété intellectuelle",
    fields: [
      {
        id: "IP_CLAUSE",
        label: "Qui conserve les droits sur les livrables ?",
        placeholder: "Le Client devient propriétaire des livrables après paiement intégral.",
        type: "textarea",
        required: true,
      },
    ],
  },
];
