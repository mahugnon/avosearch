import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

const BAIL_COMMERCIAL_TEXT = `BAIL COMMERCIAL

Entre les soussignés :
La SCI Exemple Immobilier, dont le siège social est situé 10 rue de la Démonstration, 75011 Paris, représentée par M. Bailleur Fictif, ci-après dénommée « le Bailleur »,
et
La SARL Boutique Démo, dont le siège social est situé 12 rue de la Démonstration, 75011 Paris, représentée par Mme Preneuse Fictive, ci-après dénommée « le Preneur ».

Article 1 — Désignation
Le Bailleur donne à bail au Preneur un local commercial d'une surface d'environ 45 m² situé au rez-de-chaussée du 12 rue de la Démonstration, 75011 Paris.

Article 2 — Durée
Le présent bail est consenti pour une durée de neuf (9) années entières et consécutives à compter du 1er septembre 2026. Le Preneur renonce expressément à sa faculté de résiliation triennale.

Article 3 — Loyer
Le loyer annuel est fixé à la somme de 24 000 euros hors taxes et hors charges, payable trimestriellement d'avance. Le loyer sera indexé chaque année sur l'indice des loyers commerciaux (ILC), sans que cette indexation puisse jouer à la baisse.

Article 4 — Dépôt de garantie
Le Preneur verse ce jour un dépôt de garantie égal à six (6) mois de loyer hors taxes, non productif d'intérêts.

Article 5 — Charges et travaux
Le Preneur supportera l'intégralité des charges, impôts, taxes et redevances liés au local, y compris la taxe foncière et les grosses réparations relevant de l'article 606 du Code civil.

Article 6 — Destination
Les locaux sont destinés exclusivement à une activité de vente de prêt-à-porter. Toute activité connexe ou complémentaire est interdite sans l'accord écrit préalable du Bailleur.

Article 7 — Cession et sous-location
Toute cession du droit au bail est soumise à l'agrément préalable et discrétionnaire du Bailleur. La sous-location, totale ou partielle, est strictement interdite.

Article 8 — Clause résolutoire
À défaut de paiement d'un seul terme de loyer à son échéance, et huit (8) jours après un simple commandement de payer demeuré infructueux, le bail sera résilié de plein droit.`;

const PRESTATION_TEXT = `CONTRAT DE PRESTATION DE SERVICES

Entre :
La SASU Studio Démo Web, immatriculée au RCS de Lyon sous le numéro 000 000 000, représentée par M. Prestataire Fictif, ci-après « le Prestataire »,
et
La SARL Client Exemple, immatriculée au RCS de Lyon sous le numéro 111 111 111, représentée par Mme Cliente Fictive, ci-après « le Client ».

Article 1 — Objet
Le Prestataire s'engage à concevoir et développer pour le Client un site internet de commerce électronique, conformément au cahier des charges annexé au présent contrat.

Article 2 — Durée et délais
Le contrat prend effet à sa signature pour une durée de six (6) mois. Les délais de livraison sont donnés à titre purement indicatif et ne sauraient engager le Prestataire.

Article 3 — Prix et paiement
Le prix global et forfaitaire est fixé à 18 000 euros hors taxes, payable comme suit : 50 % à la commande, 50 % à la livraison. Tout retard de paiement entraînera une pénalité égale à 15 % du montant total du contrat par mois de retard.

Article 4 — Propriété intellectuelle
L'ensemble des développements, codes sources, maquettes et créations réalisés dans le cadre du présent contrat demeure la propriété exclusive du Prestataire. Le Client bénéficie d'un simple droit d'usage, non exclusif et non cessible, pour ses besoins internes.

Article 5 — Responsabilité
La responsabilité du Prestataire, toutes causes confondues, est plafonnée à 10 % des sommes effectivement versées par le Client. Le Prestataire ne pourra en aucun cas être tenu responsable des dommages indirects, pertes de données ou pertes d'exploitation.

Article 6 — Résiliation
Le Client ne pourra résilier le contrat qu'en cas de faute lourde du Prestataire, après mise en demeure restée sans effet pendant soixante (60) jours. En cas de résiliation, les sommes versées restent acquises au Prestataire.

Article 7 — Non-sollicitation
Le Client s'interdit, pendant la durée du contrat et pendant trois (3) années suivant son terme, d'embaucher ou de solliciter directement ou indirectement tout collaborateur du Prestataire, sous peine d'une indemnité égale à douze (12) mois de salaire brut du collaborateur concerné.

Article 8 — Droit applicable
Le présent contrat est soumis au droit français. Tout litige relève de la compétence exclusive du tribunal de commerce de Lyon.`;

async function main() {
  console.log("Seeding database...");

  // Reset in dependency order (dev-only seed)
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.modification.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.lawyerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.create({
    data: {
      email: "admin@avosearch.test",
      passwordHash,
      name: "Admin Démo",
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
      name: "Me Exemple Un",
      barreau: "Paris",
      city: "Paris",
      specialties: ["Baux commerciaux", "Droit commercial"],
      bio: "Avocat fictif du cabinet Démo & Associés. Intervient sur les baux commerciaux et les contrats de distribution. Profil de démonstration.",
      validationPriceCents: 7900,
      flatFees: { RELECTURE: 25000, REDACTION: 40000, NEGOCIATION: 50000 },
      responseTimeHours: 24,
      verified: true,
      rating: 4.8,
      ratingCount: 32,
    },
    {
      email: "avocat2@avosearch.test",
      name: "Me Exemple Deux",
      barreau: "Lyon",
      city: "Lyon",
      specialties: ["Droit des sociétés", "Prestation de services"],
      bio: "Avocate fictive du cabinet Démo & Associés. Accompagne les TPE et freelances sur leurs contrats du quotidien. Profil de démonstration.",
      validationPriceCents: 6900,
      flatFees: { RELECTURE: 20000, REDACTION: 35000, NEGOCIATION: 45000 },
      responseTimeHours: 12,
      verified: true,
      rating: 4.9,
      ratingCount: 51,
    },
    {
      email: "avocat3@avosearch.test",
      name: "Me Exemple Trois",
      barreau: "Bordeaux",
      city: "Bordeaux",
      specialties: ["Droit du travail", "Contrats de freelance"],
      bio: "Avocat fictif. Spécialisé dans les relations contractuelles entre indépendants et donneurs d'ordre. Profil de démonstration.",
      validationPriceCents: 7500,
      flatFees: { RELECTURE: 22000, REDACTION: 38000, NEGOCIATION: 48000 },
      responseTimeHours: 24,
      verified: true,
      rating: 4.5,
      ratingCount: 18,
    },
    {
      email: "avocat4@avosearch.test",
      name: "Me Exemple Quatre",
      barreau: "Lille",
      city: "Lille",
      specialties: ["Propriété intellectuelle", "Numérique"],
      bio: "Avocate fictive. Contrats IT, licences logicielles et prestations numériques. Profil de démonstration.",
      validationPriceCents: 8900,
      flatFees: { RELECTURE: 28000, REDACTION: 42000, NEGOCIATION: 52000 },
      responseTimeHours: 48,
      verified: true,
      rating: 4.2,
      ratingCount: 9,
    },
    {
      email: "avocat5@avosearch.test",
      name: "Me Exemple Cinq",
      barreau: "Marseille",
      city: "Marseille",
      specialties: ["Droit commercial", "Droit de la consommation"],
      bio: "Avocat fictif en attente de vérification par l'équipe AvoSearch. Profil de démonstration.",
      validationPriceCents: 5900,
      flatFees: { RELECTURE: 18000, REDACTION: 30000, NEGOCIATION: 40000 },
      responseTimeHours: 24,
      verified: false,
      rating: null,
      ratingCount: 0,
    },
    {
      email: "avocat6@avosearch.test",
      name: "Me Exemple Six",
      barreau: "Nantes",
      city: "Nantes",
      specialties: ["Baux commerciaux", "Droit immobilier contractuel"],
      bio: "Avocate fictive en attente de vérification par l'équipe AvoSearch. Profil de démonstration.",
      validationPriceCents: 6500,
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

  await prisma.contract.create({
    data: {
      ownerId: client1.id,
      title: "Bail commercial — boutique Paris 11e",
      extractedText: BAIL_COMMERCIAL_TEXT,
      userQuestion:
        "On me propose ce bail pour ma première boutique. Certaines clauses me semblent dures (dépôt de garantie, travaux, cession) : est-ce normal ?",
      analysis: {
        create: {
          triage: "IA_SUFFIT",
          confidence: 0.82,
          domain: "bail commercial",
          justification:
            "Il s'agit d'un bail commercial standard avec quelques clauses exigeantes (dépôt de garantie élevé, renonciation à la résiliation triennale, cession restreinte). Des ajustements ciblés peuvent être envisagés en suivi de modifications, sous réserve de votre situation.",
          flags: [
            "dépôt de garantie de 6 mois",
            "renonciation à la résiliation triennale",
            "cession soumise à agrément discrétionnaire",
            "charges incluant grosses réparations",
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
      title: "Contrat de prestation de services — développement web",
      extractedText: PRESTATION_TEXT,
      userQuestion:
        "Je suis la cliente : le prestataire garde la propriété du code et limite fortement sa responsabilité. Que faut-il renégocier ?",
      analysis: {
        create: {
          triage: "AVOCAT_RECOMMANDE",
          confidence: 0.88,
          domain: "prestation de services / propriété intellectuelle",
          justification:
            "Le contrat présente une asymétrie notable : cession de propriété intellectuelle au profit du prestataire, plafond de responsabilité très bas et pénalités de retard élevées. L'enjeu justifie l'accompagnement d'un avocat pour renégocier les clauses essentielles.",
          flags: [
            "propriété intellectuelle conservée par le prestataire",
            "responsabilité plafonnée à 10 %",
            "pénalités de retard de 15 % par mois",
            "clause de non-sollicitation de 3 ans",
          ],
          requiredPro: "AVOCAT",
          model: "seed",
        },
      },
    },
  });

  console.log("Seed completed:");
  console.log("  1 admin, 2 clients, 6 lawyers (4 verified, 2 pending), 2 contracts");
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
