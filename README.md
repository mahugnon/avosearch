# AvoSearch

MVP d'une plateforme legaltech française : un utilisateur (particulier, freelance, TPE) dépose un contrat ou décrit sa question contractuelle ; un triage automatisé l'oriente vers la bonne solution — relecture assistée en suivi de modifications, validation de ces modifications par un avocat, mission avocat au forfait, ou orientation vers un professionnel réglementé.

> AvoSearch est un **outil d'aide documentaire** et une plateforme de mise en relation. Ce n'est pas un cabinet d'avocats et le service ne constitue pas une consultation juridique.

## Stack

- **Next.js (App Router) + TypeScript strict**, `pnpm`
- **Tailwind CSS + shadcn/ui**
- **PostgreSQL + Prisma** (Postgres via docker-compose)
- **Auth.js** (e-mail + mot de passe, sessions JWT, 3 rôles : `CLIENT`, `LAWYER`, `ADMIN`)
- **@anthropic-ai/sdk** pour le triage et la relecture IA (Phase 1+)
- **Zod** pour la validation des entrées API et des sorties JSON de l'IA
- Stockage fichiers : disque local `./storage` derrière une interface `StorageProvider`

## Installation en 5 commandes

```bash
pnpm install
cp .env.example .env      # puis renseignez AUTH_SECRET (openssl rand -base64 32) et ANTHROPIC_API_KEY
pnpm db:up                # démarre Postgres (Docker) sur le port hôte 5433
pnpm db:migrate           # applique les migrations puis exécute le seed
pnpm dev                  # http://localhost:3000
```

Si le seed n'a pas été lancé automatiquement par la migration : `pnpm db:seed`.

> **Port Postgres** : la base Docker écoute sur le port hôte **5433** (5432 est souvent occupé par un Postgres local). L'URL de `.env.example` est déjà configurée en conséquence.

## Comptes de démonstration

Toutes les identités sont fictives. Mot de passe commun : `demo1234`.

| Rôle | E-mail | Détail |
| --- | --- | --- |
| Admin | `admin@avosearch.test` | Vérification des profils avocats |
| Client | `client1@avosearch.test` | Possède 2 contrats d'exemple (bail commercial, prestation de services) |
| Client | `client2@avosearch.test` | Compte vierge |
| Avocat | `avocat1@avosearch.test` → `avocat4@avosearch.test` | Profils vérifiés |
| Avocat | `avocat5@avosearch.test`, `avocat6@avosearch.test` | En attente de vérification |

## Structure du projet

```
app/
  (auth)/           # /login, /register, /register/lawyer
  app/              # espace client (rôle CLIENT)
  lawyer/           # espace avocat (rôle LAWYER)
  admin/            # administration (rôle ADMIN)
  legal/            # CGU, mentions légales, confidentialité
  api/auth/         # routes Auth.js
components/
  ui/               # composants shadcn/ui
  auth/, layout/    # composants applicatifs
lib/
  auth.ts           # instance NextAuth (credentials + bcrypt)
  auth.config.ts    # config edge-safe partagée avec le proxy
  db.ts             # client Prisma singleton
  config.ts         # tarifs par défaut (surcharge via env)
  storage/          # interface StorageProvider + implémentation disque local
  actions/          # server actions (auth)
  validation/       # schémas Zod
prisma/
  schema.prisma     # modèle de données complet
  seed.ts           # données de démonstration
proxy.ts            # protection des routes par rôle
```

## Feuille de route

- [x] **Phase 0 — Socle** : scaffold, Prisma + Postgres, Auth.js 3 rôles, layout, seed, README
- [ ] **Phase 1 — Triage** : upload + extraction de texte, endpoint `analyze`, écran de résultat
- [ ] **Phase 2 — Relecture IA** : endpoint `review`, vue diff, consentement + disclaimer
- [ ] **Phase 3 — Marketplace** : matching, missions, messagerie, validation avocat, admin
- [ ] **Phase 4 — Paiements et finitions** : Stripe test, notation, scénario de démonstration

## Variables d'environnement

Voir [.env.example](.env.example). Les montants des formules sont configurables via `PRICE_*` (défauts dans `lib/config.ts`).

## Conformité

- Interface exclusivement en français ; code et identifiants en anglais.
- Aucun wording du type « conseil juridique » ; disclaimers systématiques sur les livrables IA.
- Seed 100 % fictif (« Me Exemple Un », cabinet « Démo & Associés »).
- Pages légales : documents de travail, à faire valider par un avocat avant mise en production.
