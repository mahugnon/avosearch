import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export const en: Dictionary = {
  common: {
    logout: "Sign out",
    mySpace: "My dashboard",
    signIn: "Sign in",
    signUp: "Create account",
    perContract: "/ contract",
    demoDisclaimer:
      "AvoSearch is an automated document assistance tool and does not provide legal advice.",
    legalDisclaimer: "Automated document assistance — not legal advice.",
  },
  areas: {
    client: "Client area",
    lawyer: "Lawyer area",
    admin: "Administration",
  },
  client: {
    eyebrow: "Client area",
    greeting: "Hello",
    greetingName: "Hello, {name}",
    subtitle:
      "Describe your need or upload your contract — we'll guide you to the right solution.",
    recentContracts: "My recent contracts",
    documentsEmpty: "Your analyzed documents will appear here.",
    documentsCount: "{count} document",
    documentsCountPlural: "{count} documents",
    emptyTitle: "No contracts yet",
    emptyHint: "Start an analysis above to upload your first document.",
    depositedOn: "Uploaded on",
    statusAnalyzed: "Analyzed",
    statusPending: "Pending",
  },
  chat: {
    title: "New analysis",
    subtitle: "Guided conversation before triaging your request.",
    online: "Online",
    welcome:
      "Hello. Describe your contractual situation or upload a document — I'll ask a few questions before guiding you to the right solution.",
    clarifications: [
      "What type of contract is involved (lease, services, NDA…)? Do you already have the text, or is this a general question?",
      "What is the main stake (amount, duration, disputed clause, imminent signature)? Is a regulated act involved?",
      "Do you mainly want to understand the document, have it reviewed clause by clause, or get lawyer validation before signing?",
    ],
    triagePreview:
      "I have enough information to start triage. In Phase 1, I would guide you toward: AI-assisted review, lawyer validation, or referral to a regulated professional. The engine is not connected yet.",
    placeholder: "Describe your question or contract…",
    send: "Send message",
    attach: "Attach a contract",
  },
  landing: {
    badge: "Contracts only · guidance in under a minute",
    heroTitle: "Your contracts, reviewed and secured — with or without a lawyer",
    heroSubtitle:
      "AvoSearch flags risky clauses, suggests tracked changes, and connects you with a verified lawyer when your situation requires it.",
    ctaPrimary: "Analyze my contract",
    ctaLawyer: "I'm a lawyer",
    heroDisclaimer: "Automated document assistance — not legal advice.",
    processEyebrow: "Process",
    processTitle: "How it works",
    pricingEyebrow: "Pricing",
    pricingTitle: "Our plans",
    pricingSubtitle: "Fixed prices, known before any commitment. Indicative prices incl. VAT.",
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",
    ctaTitle: "A contract to sign this week?",
    ctaSubtitle:
      "Upload it now: you'll know within minutes whether it can be adjusted directly or deserves a lawyer's review.",
    ctaButton: "Get started for free",
    navHow: "How it works",
    navPricing: "Pricing",
    navFaq: "FAQ",
    recommended: "Recommended",
    steps: [
      {
        title: "Upload your contract",
        description:
          "Upload a PDF, DOCX or text file, or simply describe your contractual question.",
      },
      {
        title: "Get clear guidance",
        description:
          "Our tool identifies key points and guides you: AI-assisted review, flat-fee lawyer, or regulated professional.",
      },
      {
        title: "Choose your level",
        description:
          "Review changes yourself, or have each one validated by a bar-registered lawyer.",
      },
    ],
    plans: [
      {
        title: "AI-assisted review",
        description:
          "Suggested changes in track-changes mode; you accept or reject each one.",
      },
      {
        title: "Review + lawyer validation",
        description:
          "A verified lawyer reviews, validates or amends each suggested change. Response within 24 h.",
      },
      {
        title: "Flat-fee lawyer mission",
        description:
          "Full review, drafting or negotiation by a lawyer, at a fixed price agreed upfront.",
      },
    ],
    faq: [
      {
        question: "Does AvoSearch replace a lawyer?",
        answer:
          "No. AvoSearch is a document assistance tool: it helps you understand your contract and prepare changes. For advice on your situation, choose the plan with lawyer validation or a flat-fee mission.",
      },
      {
        question: "Which documents can I analyze?",
        answer:
          "Contracts only: commercial lease, services agreement, terms & conditions, partnership, etc. Criminal, family or litigation matters are out of scope — we'll refer you to the right professional without analysis.",
      },
      {
        question: "Who are the platform lawyers?",
        answer:
          "Lawyers registered with a French bar. Each profile is manually verified by our team before receiving the « Verified » badge.",
      },
      {
        question: "How much does it cost?",
        answer:
          "Three fixed-price plans, displayed before any commitment: AI-assisted review, review with lawyer validation, or flat-fee mission agreed upfront. No hourly billing, no surprises.",
      },
      {
        question: "Are my documents confidential?",
        answer:
          "Your documents are accessible only to you and, if you choose, the assigned lawyer. You can export your data and delete your account at any time.",
      },
    ],
  },
  auth: {
    demoNote:
      "Demo platform — no real data. AvoSearch is a document assistance tool and does not provide legal advice.",
    loginTitle: "Sign in",
    loginSubtitle: "Access your AvoSearch dashboard.",
    email: "Email address",
    password: "Password",
    emailPlaceholder: "you@example.com",
    submitLogin: "Sign in",
    submittingLogin: "Signing in...",
    noAccount: "Don't have an account?",
    createAccount: "Create account",
    registerTitle: "Create account",
    registerSubtitle: "Upload your first contract in minutes.",
    name: "Full name",
    submitRegister: "Create my account",
    submittingRegister: "Creating...",
    hasAccount: "Already have an account?",
    signInLink: "Sign in",
    lawyerRegisterTitle: "Lawyer registration",
    lawyerRegisterSubtitle: "Join the AvoSearch marketplace.",
    passwordHint: "At least 8 characters.",
    alreadyRegistered: "Already registered?",
    areYouLawyer: "Are you a lawyer?",
    lawyerSignupLink: "Lawyer registration",
    lawyerRegisterDesc:
      "Your profile will be manually verified by our team before being visible to clients.",
  },
  footer: {
    description:
      "AvoSearch is a document assistance tool and a platform connecting you with lawyers registered with a French bar. AvoSearch is not a law firm and does not provide legal advice.",
    cgu: "Terms of use",
    legal: "Legal notice",
    privacy: "Privacy policy",
    demoNote: "Demo platform — no real data, no real lawyers.",
  },
  lawyer: {
    title: "Dashboard",
    subtitle: "Your validations, missions and earnings — workflows arrive in Phase 3.",
    pendingTitle: "Profile pending verification",
    pendingDescription:
      "Our team manually verifies each profile. You won't receive missions until your profile is verified.",
  },
  admin: {
    title: "Lawyer verification",
    pendingSingular: "{count} profile pending. Approve / Reject actions arrive in Phase 3.",
    pendingPlural: "{count} profiles pending. Approve / Reject actions arrive in Phase 3.",
    tableLawyer: "Lawyer",
    tableBar: "Bar",
    tableSpecialties: "Specialties",
    tableRate: "Validation rate",
    tableStatus: "Status",
    verified: "Verified",
    pending: "Pending",
  },
};
