import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export const fr: Dictionary = {
  common: {
    logout: "Déconnexion",
    mySpace: "Mon espace",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    perContract: "/ contrat",
    demoDisclaimer:
      "AvoSearch est un outil d'aide documentaire automatisée et ne fournit pas de consultation juridique.",
    legalDisclaimer:
      "Aide documentaire automatisée — ne constitue pas une consultation juridique.",
  },
  areas: {
    client: "Espace client",
    lawyer: "Espace avocat",
    admin: "Administration",
  },
  client: {
    eyebrow: "Espace client",
    greeting: "Bonjour",
    greetingName: "Bonjour, {name}",
    subtitle:
      "Décrivez votre besoin ou déposez votre contrat — nous vous orientons vers la bonne solution.",
    recentContracts: "Mes derniers contrats",
    documentsEmpty: "Vos documents analysés apparaîtront ici.",
    documentsCount: "{count} document",
    documentsCountPlural: "{count} documents",
    emptyTitle: "Aucun contrat pour le moment",
    emptyHint: "Lancez une analyse ci-dessus pour déposer votre premier document.",
    depositedOn: "Déposé le",
    statusAnalyzed: "Analysé",
    statusPending: "En attente",
  },
  chat: {
    title: "Nouvelle analyse",
    subtitle: "Conversation guidée avant le triage de votre demande.",
    online: "En ligne",
    welcome:
      "Bonjour. Décrivez votre situation contractuelle ou déposez un document — je vous poserai quelques questions avant de vous orienter vers la bonne solution.",
    clarifications: [
      "Quel type de contrat est concerné (bail, prestation, NDA…) ? Avez-vous déjà le texte, ou s'agit-il d'une question générale ?",
      "Quel est l'enjeu principal (montant, durée, clause litigieuse, signature imminente) ? Y a-t-il un acte réglementé en jeu ?",
      "Souhaitez-vous surtout comprendre le document, le faire relire clause par clause, ou obtenir une validation avocat avant signature ?",
    ],
    triagePreview:
      "J'ai assez d'éléments pour lancer le triage. En Phase 1, je vous orienterais vers : relecture assistée, validation avocat, ou orientation vers un professionnel réglementé. Le moteur n'est pas encore connecté.",
    placeholder: "Décrivez votre question ou votre contrat…",
    send: "Envoyer le message",
    attach: "Joindre un contrat",
  },
  landing: {
    badge: "Contrats uniquement · orientation en moins d'une minute",
    heroTitle: "Vos contrats, relus et sécurisés — avec ou sans avocat",
    heroSubtitle:
      "AvoSearch repère les clauses à risque, propose des modifications en suivi de modifications, et vous met en relation avec un avocat vérifié quand votre situation le demande.",
    ctaPrimary: "Analyser mon contrat",
    ctaLawyer: "Je suis avocat",
    heroDisclaimer:
      "Aide documentaire automatisée — ne constitue pas une consultation juridique.",
    processEyebrow: "Processus",
    processTitle: "Comment ça marche",
    pricingEyebrow: "Tarification",
    pricingTitle: "Nos formules",
    pricingSubtitle: "Des prix fixes, connus avant tout engagement. Prix TTC indicatifs.",
    faqEyebrow: "FAQ",
    faqTitle: "Questions fréquentes",
    ctaTitle: "Un contrat à signer cette semaine ?",
    ctaSubtitle:
      "Déposez-le maintenant : vous saurez en quelques minutes s'il peut être ajusté directement ou s'il mérite l'œil d'un avocat.",
    ctaButton: "Commencer gratuitement",
    navHow: "Comment ça marche",
    navPricing: "Tarifs",
    navFaq: "FAQ",
    recommended: "Recommandée",
    steps: [
      {
        title: "Déposez votre contrat",
        description:
          "Téléversez un PDF, un DOCX ou un texte, ou décrivez simplement votre question contractuelle.",
      },
      {
        title: "Obtenez une orientation",
        description:
          "Notre outil identifie les points d'attention et vous oriente : relecture assistée, avocat au forfait, ou professionnel réglementé.",
      },
      {
        title: "Choisissez votre niveau",
        description:
          "Relisez les modifications vous-même, ou faites-les valider une à une par un avocat inscrit au barreau.",
      },
    ],
    plans: [
      {
        title: "Relecture assistée",
        description:
          "Modifications proposées en suivi de modifications ; vous acceptez ou rejetez chaque changement.",
      },
      {
        title: "Relecture + validation avocat",
        description:
          "Un avocat vérifié relit, valide ou amende chaque modification proposée. Réponse sous 24 h.",
      },
      {
        title: "Mission avocat au forfait",
        description:
          "Relecture complète, rédaction ou négociation par un avocat, à prix fixe convenu à l'avance.",
      },
    ],
    faq: [
      {
        question: "AvoSearch remplace-t-il un avocat ?",
        answer:
          "Non. AvoSearch est un outil d'aide documentaire : il vous aide à comprendre votre contrat et à préparer des modifications. Pour un avis sur votre situation, choisissez la formule avec validation par un avocat ou une mission au forfait.",
      },
      {
        question: "Quels documents puis-je faire analyser ?",
        answer:
          "Uniquement des contrats : bail commercial, prestation de services, CGV, partenariat, etc. Les sujets pénaux, familiaux ou contentieux sont hors périmètre : nous vous orientons alors vers le bon professionnel, sans analyse.",
      },
      {
        question: "Qui sont les avocats de la plateforme ?",
        answer:
          "Des avocats inscrits à un barreau français. Chaque profil est vérifié manuellement par notre équipe avant d'obtenir le badge « Vérifié ».",
      },
      {
        question: "Combien ça coûte ?",
        answer:
          "Trois formules à prix fixes, affichés avant tout engagement : relecture assistée, relecture avec validation avocat, ou mission au forfait convenue à l'avance. Aucune facturation à l'heure, aucune surprise.",
      },
      {
        question: "Mes documents sont-ils confidentiels ?",
        answer:
          "Vos documents ne sont accessibles qu'à vous et, si vous le décidez, à l'avocat missionné. Vous pouvez exporter vos données et supprimer votre compte à tout moment.",
      },
    ],
  },
  auth: {
    demoNote:
      "Plateforme de démonstration — aucune donnée réelle. AvoSearch est un outil d'aide documentaire et ne fournit pas de consultation juridique.",
    loginTitle: "Connexion",
    loginSubtitle: "Accédez à votre espace AvoSearch.",
    email: "Adresse e-mail",
    password: "Mot de passe",
    emailPlaceholder: "vous@exemple.fr",
    submitLogin: "Se connecter",
    submittingLogin: "Connexion...",
    noAccount: "Pas encore de compte ?",
    createAccount: "Créer un compte",
    registerTitle: "Créer un compte",
    registerSubtitle: "Déposez votre premier contrat en quelques minutes.",
    name: "Nom complet",
    submitRegister: "Créer mon compte",
    submittingRegister: "Création...",
    hasAccount: "Déjà un compte ?",
    signInLink: "Se connecter",
    lawyerRegisterTitle: "Inscription avocat",
    lawyerRegisterSubtitle: "Rejoignez la marketplace AvoSearch.",
    passwordHint: "8 caractères minimum.",
    alreadyRegistered: "Déjà inscrit ?",
    areYouLawyer: "Vous êtes avocat ?",
    lawyerSignupLink: "Inscription avocat",
    lawyerRegisterDesc:
      "Votre profil sera vérifié manuellement par notre équipe avant d'être visible des clients.",
  },
  footer: {
    description:
      "AvoSearch est un outil d'aide documentaire et une plateforme de mise en relation avec des avocats inscrits à un barreau français. AvoSearch n'est pas un cabinet d'avocats et ne fournit pas de consultation juridique.",
    cgu: "Conditions générales d'utilisation",
    legal: "Mentions légales",
    privacy: "Politique de confidentialité",
    demoNote: "Plateforme de démonstration — aucune donnée réelle, aucun avocat réel.",
  },
  lawyer: {
    title: "Tableau de bord",
    subtitle: "Vos validations, missions et gains — les flux arrivent avec la Phase 3.",
    pendingTitle: "Profil en attente de vérification",
    pendingDescription:
      "Notre équipe vérifie manuellement chaque profil. Vous ne recevrez pas de missions tant que votre profil n'est pas vérifié.",
  },
  admin: {
    title: "Vérification des avocats",
    pendingSingular: "{count} profil en attente. Les actions Vérifier / Refuser arrivent avec la Phase 3.",
    pendingPlural: "{count} profils en attente. Les actions Vérifier / Refuser arrivent avec la Phase 3.",
    tableLawyer: "Avocat",
    tableBar: "Barreau",
    tableSpecialties: "Spécialités",
    tableRate: "Tarif validation",
    tableStatus: "Statut",
    verified: "Vérifié",
    pending: "En attente",
  },
};
