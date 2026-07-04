import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import { ALLOWED_MIME_TYPES } from "../lib/extract/text";
import { extractPlaceholdersFromBuffer } from "../lib/templates/load";
import { storage } from "../lib/storage";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

const SEED_TEMPLATES_DIR = path.join(process.cwd(), "seeds/templates");

const SEED_TEMPLATES = [
  {
    slug: "nda-bilateral",
    title: "Confidentiality agreement (NDA) — bilateral",
    description:
      "Professional bilateral NDA between two companies, with source file and variables filled in conversation.",
    domain: "confidentiality / NDA",
    tags: ["nda", "confidentiality", "bilateral", "company", "project", "demo"],
    fileName: "nda-bilateral.txt",
    draftGuide: `Bilateral NDA between two companies. Collect Party A then Party B details, project description, confidentiality terms, then signature block. Demo: TechVision SAS (Paris) and Innovate Lab SARL (Lyon).`,
  },
  {
    slug: "nda-site-web",
    title: "Confidentiality agreement (NDA) — website",
    description: "NDA template to protect information related to a website or online activity.",
    domain: "confidentiality / NDA",
    tags: ["nda", "confidentiality", "website", "internet", "saas"],
    fileName: "nda-site-web.txt",
    draftGuide: "Website NDA — collect the parties, URL, and term.",
  },
  {
    slug: "prestation-services",
    title: "Services agreement",
    description: "Template agreement between a client and a freelancer or small business.",
    domain: "services",
    tags: ["services", "freelance", "development", "consulting"],
    fileName: "prestation-services.txt",
    draftGuide: "Services agreement — client, provider, description, price and term.",
  },
] as const;

async function seedTemplateFile(input: (typeof SEED_TEMPLATES)[number]) {
  const buffer = await fs.readFile(path.join(SEED_TEMPLATES_DIR, input.fileName));
  const fileKey = `templates/${input.slug}/${input.fileName}`;
  const { placeholders } = await extractPlaceholdersFromBuffer(buffer, ALLOWED_MIME_TYPES.txt);
  await storage.save(fileKey, buffer);

  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    domain: input.domain,
    tags: [...input.tags],
    draftGuide: input.draftGuide,
    fileKey,
    fileName: input.fileName,
    mimeType: ALLOWED_MIME_TYPES.txt,
    placeholders,
  };
}

function lawyerPhoto(seed: string) {
  return `https://api.dicebear.com/9.x/personas/png?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

const BAIL_COMMERCIAL_TEXT = `COMMERCIAL LEASE

Between:
Demo Property SCI, whose registered office is located at 10 Demo Street, 75011 Paris, represented by Mr. Demo Landlord, hereinafter the "Landlord",
and
Demo Boutique SARL, whose registered office is located at 12 Demo Street, 75011 Paris, represented by Ms. Demo Tenant, hereinafter the "Tenant".

Article 1 — Premises
The Landlord leases to the Tenant commercial premises of approximately 45 sqm located on the ground floor of 12 Demo Street, 75011 Paris.

Article 2 — Term
This lease is granted for nine (9) full consecutive years starting 1 September 2026. The Tenant expressly waives the right to terminate the lease at the end of each three-year period.

Article 3 — Rent
Annual rent is set at EUR 24,000 excluding tax and service charges, payable quarterly in advance. Rent shall be indexed each year based on the commercial rent index (ILC), without any downward adjustment.

Article 4 — Security deposit
The Tenant pays today a security deposit equal to six (6) months' rent excluding tax, non-interest bearing.

Article 5 — Charges and works
The Tenant shall bear all charges, taxes, levies and fees relating to the premises, including property tax and major repairs under Article 606 of the French Civil Code.

Article 6 — Use
The premises are exclusively for retail clothing sales. Any related or ancillary activity is prohibited without the Landlord's prior written consent.

Article 7 — Assignment and subletting
Any assignment of the lease requires the Landlord's prior and discretionary approval. Subletting, in whole or in part, is strictly prohibited.

Article 8 — Forfeiture clause
Failure to pay any rent installment when due, and eight (8) days after a formal demand to pay remains unsuccessful, shall result in automatic termination of the lease.`;

const PRESTATION_TEXT = `SERVICES AGREEMENT

Between:
Demo Web Studio SASU, registered with the Lyon Trade Register under number 000 000 000, represented by Mr. Demo Provider, hereinafter the "Provider",
and
Example Client SARL, registered with the Lyon Trade Register under number 111 111 111, represented by Ms. Demo Client, hereinafter the "Client".

Article 1 — Purpose
The Provider agrees to design and develop an e-commerce website for the Client in accordance with the specifications annexed to this agreement.

Article 2 — Term and deadlines
This agreement takes effect upon signature for six (6) months. Delivery timelines are indicative only and do not bind the Provider.

Article 3 — Price and payment
The fixed price is EUR 18,000 excluding tax, payable as follows: 50% on order, 50% on delivery. Any late payment shall incur a penalty equal to 15% of the total contract amount per month of delay.

Article 4 — Intellectual property
All developments, source code, designs and creations made under this agreement remain the exclusive property of the Provider. The Client receives only a non-exclusive, non-transferable right of use for internal needs.

Article 5 — Liability
The Provider's liability, for any cause whatsoever, is capped at 10% of amounts actually paid by the Client. The Provider shall not be liable for indirect damages, data loss or loss of business.

Article 6 — Termination
The Client may terminate only for gross misconduct by the Provider, after a formal notice remains without effect for sixty (60) days. Amounts paid remain due to the Provider upon termination.

Article 7 — Non-solicitation
The Client shall not, during the term and for three (3) years thereafter, hire or solicit any employee of the Provider, under penalty of an indemnity equal to twelve (12) months' gross salary of the employee concerned.

Article 8 — Governing law
This agreement is governed by French law. Any dispute shall fall within the exclusive jurisdiction of the Lyon Commercial Court.`;

async function main() {
  console.log("Seeding database...");

  // Reset in dependency order (dev-only seed)
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.modification.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.contractTemplate.deleteMany();
  await prisma.lawyerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.create({
    data: {
      email: "admin@avosearch.test",
      passwordHash,
      name: "Demo Admin",
      role: Role.ADMIN,
    },
  });

  const client1 = await prisma.user.create({
    data: {
      email: "client1@avosearch.test",
      passwordHash,
      name: "Camille Martin",
      role: Role.CLIENT,
    },
  });

  await prisma.user.create({
    data: {
      email: "client2@avosearch.test",
      passwordHash,
      name: "Jules Bernard",
      role: Role.CLIENT,
    },
  });

  const lawyers = [
    {
      email: "avocat1@avosearch.test",
      name: "Demo Lawyer One",
      barreau: "Paris",
      city: "Paris",
      specialties: ["Commercial leases", "Commercial law"],
      bio: "Fictional lawyer at Demo & Partners. Works on commercial leases and distribution agreements. Demo profile only.",
      validationPriceCents: 7900,
      hourlyRateCents: 18000,
      flatFees: { RELECTURE: 25000, REDACTION: 40000, NEGOCIATION: 50000 },
      responseTimeHours: 24,
      verified: true,
      rating: 4.8,
      ratingCount: 32,
      photoUrl: lawyerPhoto("avocat1"),
    },
    {
      email: "avocat2@avosearch.test",
      name: "Demo Lawyer Two",
      barreau: "Lyon",
      city: "Lyon",
      specialties: ["Corporate law", "Services agreements"],
      bio: "Fictional lawyer at Demo & Partners. Advises small businesses and freelancers on day-to-day contracts. Demo profile only.",
      validationPriceCents: 6900,
      hourlyRateCents: 16000,
      flatFees: { RELECTURE: 20000, REDACTION: 35000, NEGOCIATION: 45000 },
      responseTimeHours: 12,
      verified: true,
      rating: 4.9,
      ratingCount: 51,
      photoUrl: lawyerPhoto("avocat2"),
    },
    {
      email: "avocat3@avosearch.test",
      name: "Demo Lawyer Three",
      barreau: "Bordeaux",
      city: "Bordeaux",
      specialties: ["Employment law", "Freelance contracts"],
      bio: "Fictional lawyer specializing in contractual relationships between independents and clients. Demo profile only.",
      validationPriceCents: 7500,
      hourlyRateCents: 17000,
      flatFees: { RELECTURE: 22000, REDACTION: 38000, NEGOCIATION: 48000 },
      responseTimeHours: 24,
      verified: true,
      rating: 4.5,
      ratingCount: 18,
      photoUrl: lawyerPhoto("avocat3"),
    },
    {
      email: "avocat4@avosearch.test",
      name: "Demo Lawyer Four",
      barreau: "Lille",
      city: "Lille",
      specialties: ["Intellectual property", "Technology"],
      bio: "Fictional lawyer. IT contracts, software licenses and digital services. Demo profile only.",
      validationPriceCents: 8900,
      hourlyRateCents: 20000,
      flatFees: { RELECTURE: 28000, REDACTION: 42000, NEGOCIATION: 52000 },
      responseTimeHours: 48,
      verified: true,
      rating: 4.2,
      ratingCount: 9,
      photoUrl: lawyerPhoto("avocat4"),
    },
    {
      email: "avocat5@avosearch.test",
      name: "Demo Lawyer Five",
      barreau: "Marseille",
      city: "Marseille",
      specialties: ["Commercial law", "Consumer law"],
      bio: "Fictional lawyer pending verification by the AvoSearch team. Demo profile only.",
      validationPriceCents: 5900,
      hourlyRateCents: 14000,
      flatFees: { RELECTURE: 18000, REDACTION: 30000, NEGOCIATION: 40000 },
      responseTimeHours: 24,
      verified: false,
      rating: null,
      ratingCount: 0,
    },
    {
      email: "avocat6@avosearch.test",
      name: "Demo Lawyer Six",
      barreau: "Nantes",
      city: "Nantes",
      specialties: ["Commercial leases", "Real estate contracts"],
      bio: "Fictional lawyer pending verification by the AvoSearch team. Demo profile only.",
      validationPriceCents: 6500,
      hourlyRateCents: 15000,
      flatFees: { RELECTURE: 21000, REDACTION: 36000, NEGOCIATION: 46000 },
      responseTimeHours: 12,
      verified: false,
      rating: null,
      ratingCount: 0,
    },
  ];

  for (const lawyer of lawyers) {
    const { email, name, ...profile } = lawyer;
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: Role.LAWYER,
        lawyerProfile: { create: profile },
      },
    });
  }

  const templateRows = await Promise.all(SEED_TEMPLATES.map(seedTemplateFile));
  await prisma.contractTemplate.createMany({ data: templateRows });

  await prisma.contract.create({
    data: {
      ownerId: client1.id,
      title: "Commercial lease — Paris 11th boutique",
      extractedText: BAIL_COMMERCIAL_TEXT,
      userQuestion:
        "I'm being offered this lease for my first shop. Some clauses seem harsh (security deposit, works, assignment): is that normal?",
      analysis: {
        create: {
          triage: "IA_SUFFIT",
          confidence: 0.82,
          domain: "commercial lease",
          justification:
            "This is a standard commercial lease with a few demanding clauses (high security deposit, waiver of triennial termination, restricted assignment). Targeted adjustments may be considered in follow-up modifications, depending on your situation.",
          flags: [
            "6-month security deposit",
            "waiver of triennial termination",
            "assignment subject to discretionary approval",
            "charges including major repairs",
          ],
          requiredPro: null,
          model: "seed",
        },
      },
    },
  });

  await prisma.contract.create({
    data: {
      ownerId: client1.id,
      title: "Services agreement — web development",
      extractedText: PRESTATION_TEXT,
      userQuestion:
        "I'm the client: the provider keeps ownership of the code and limits liability heavily. What should I renegotiate?",
      analysis: {
        create: {
          triage: "AVOCAT_RECOMMANDE",
          confidence: 0.88,
          domain: "services / intellectual property",
          justification:
            "The agreement shows notable asymmetry: intellectual property retained by the provider, very low liability cap and high late payment penalties. The stakes justify lawyer support to renegotiate key clauses.",
          flags: [
            "intellectual property retained by provider",
            "liability capped at 10%",
            "15% late payment penalty per month",
            "3-year non-solicitation clause",
          ],
          requiredPro: "AVOCAT",
          model: "seed",
        },
      },
    },
  });

  console.log("Seed completed:");
  console.log("  1 admin, 2 clients, 6 lawyers (4 verified, 2 pending), 2 contracts, 3 templates");
  console.log(`  All demo accounts use password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
