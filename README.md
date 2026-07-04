# AvoSearch

MVP d'une plateforme legaltech française : un utilisateur (particulier, freelance, TPE) dépose un contrat ou décrit sa question contractuelle ; un triage automatisé l'oriente vers la bonne solution — relecture assistée en suivi de modifications, validation de ces modifications par un avocat, mission avocat au forfait, ou orientation vers un professionnel réglementé.

> AvoSearch est un **outil d'aide documentaire** et une plateforme de mise en relation. Ce n'est pas un cabinet d'avocats et le service ne constitue pas une consultation juridique.

## Stack

- **Next.js (App Router) + TypeScript strict**, `pnpm`
- **Tailwind CSS + shadcn/ui**
- **PostgreSQL + Prisma** (Postgres via docker-compose)
- **Auth.js** (e-mail + mot de passe, sessions JWT, 3 rôles : `CLIENT`, `LAWYER`, `ADMIN`)
- **NVIDIA NIM** (Nemotron) pour le triage et la relecture IA
- **Zod** pour la validation des entrées API et des sorties JSON de l'IA
- Stockage fichiers : disque local `./storage` derrière une interface `StorageProvider`

## Installation en 5 commandes

```bash
pnpm install
cp .env.example .env      # puis renseignez NVIDIA_API_KEY et AUTH_SECRET
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
  api/contracts/    # analyse de triage (Phase 1+)
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
  validation/       # schémas Zod (auth, triage)
  extract/          # extraction PDF / DOCX / TXT
  ai/               # client NVIDIA NIM, prompts, triage
  contracts/        # helpers d'accès aux contrats
prisma/
  schema.prisma     # modèle de données complet
  seed.ts           # données de démonstration
proxy.ts            # protection des routes par rôle
```

## Feuille de route

- [x] **Phase 0 — Socle** : scaffold, Prisma + Postgres, Auth.js 3 rôles, layout, seed, README
- [x] **Phase 1 — Triage** : upload + extraction de texte, endpoint `analyze`, écran de résultat
- [x] **Phase 2 — Relecture IA** : endpoint `review`, vue diff, consentement + disclaimer
- [x] **Phase 3 — Marketplace** : matching, missions, messagerie, validation avocat, admin
- [x] **Phase 4 — Paiements et finitions** : Stripe test (ou mode démo), notation, scénario de démonstration

## Mise en production (hors phases MVP)

Fonctionnalités prêtes côté code ; validation juridique et clés live restent à votre charge.

| Domaine | Implémentation |
| --- | --- |
| **Pages légales** | CGU, confidentialité, mentions, [registre des traitements](/legal/registre-traitements), [sous-traitants / DPA](/legal/sous-traitants) — brouillons marqués « validation avocat requise » |
| **RGPD avancé** | Bandeau cookies (`CookieConsent`), registre + DPA, export JSON et suppression compte (`/app/settings`) |
| **Stripe prod** | Webhook idempotent (`ProcessedStripeEvent`), `paidAt` sur mission ; sans clé → mode démo |
| **E-mail** | SMTP optionnel (`lib/email/send.ts`) ; notifications mission, paiement, message, livraison, vérif avocat |
| **PDF contrat** | `GET /api/contracts/[id]/export` + bouton dans le viewer |
| **PJ messagerie** | Upload dans le chat mission (`/api/missions/attachments/[key]`) |
| **Modèles admin** | Upload PDF/DOCX/TXT + métadonnées → `/admin/templates` (fichiers dans `./storage/templates/`) |

### Checklist avant go-live

1. **Avocat** — faire valider CGU, confidentialité, mentions, registre et page sous-traitants.
2. **Migration** — `pnpm db:migrate` (ou `npx prisma migrate deploy` en CI) pour les champs PJ, paiement et `ProcessedStripeEvent`.
3. **Stripe** — clés `sk_live_…`, webhook pointant vers `/api/webhooks/stripe`, secret `whsec_…` en prod. En local : `pnpm stripe:listen`.
4. **SMTP** — renseigner `SMTP_*` et `EMAIL_FROM` ; sans SMTP les e-mails sont logués en console.
5. **URL** — `NEXT_PUBLIC_APP_URL` = URL publique (redirects Stripe et liens e-mail).
6. **Build** — `pnpm build` puis `pnpm start`.

## Variables d'environnement

Voir [.env.example](.env.example). Les montants des formules sont configurables via `PRICE_*` (défauts dans `lib/config.ts`).

## Conformité

- Interface exclusivement en français ; code et identifiants en anglais.
- Aucun wording du type « conseil juridique » ; disclaimers systématiques sur les livrables IA.
- Consentement IA explicite (`aiConsentAt`) avant relecture automatisée.
- Export JSON et suppression de compte (RGPD) : `/app/settings`.
- Bandeau cookies, registre des traitements et page sous-traitants (DPA) : `/legal/*`.
- Export PDF des contrats générés et pièces jointes dans la messagerie mission.
- Notifications e-mail transactionnelles (SMTP ou logs console).
- Seed 100 % fictif (« Me Exemple Un », cabinet « Démo & Associés »).
- Pages légales : documents de travail, à faire valider par un avocat avant mise en production.

## Scénario de démonstration (Phases 1–4)

1. **Client** `client1@avosearch.test` / `demo1234` — déposer ou rédiger un contrat, lancer le triage.
2. **Phase 2** — choisir « IA seule » ou « IA + avocat », consentir, générer les modifications, accepter/rejeter.
3. **Phase 3** — matching avocat, créer une mission, échanger via la messagerie.
4. **Phase 4** — payer (Stripe test ou mode démo sans clé), l'avocat valide et livre, le client note.
5. **Admin** `admin@avosearch.test` — vérifier les profils avocats en attente.
6. **Avocat** `avocat1@avosearch.test` — traiter les missions depuis `/lawyer/missions`.
7. **RGPD** — `/app/settings` : export JSON ou suppression de compte.
