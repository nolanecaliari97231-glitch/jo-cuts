# JO'Cuts — Site web barbershop

Site vitrine + prise de rendez-vous + back-office barbier pour **JO'Cuts**, barbershop en Martinique.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Prisma 7** + SQLite (local) → PostgreSQL en production (Neon, Supabase…)
- Specs complètes : [`JOCuts-specs.md`](./JOCuts-specs.md)

## Démarrage local

```bash
git clone https://github.com/nolanecaliari97231-glitch/jo-cuts.git
cd jo-cuts
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

- Site : [http://localhost:3000](http://localhost:3000)
- Admin : [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Compte barbier par défaut : voir `STAFF_EMAIL` / `STAFF_PASSWORD` dans `.env`

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite local : `file:./dev.db` |
| `AUTH_SECRET` | Clé secrète JWT (longue chaîne aléatoire) |
| `STAFF_EMAIL` | Email de connexion admin |
| `STAFF_PASSWORD` | Mot de passe initial (seed) |
| `RESEND_API_KEY` | (Optionnel) Envoi d'emails via [Resend](https://resend.com) |
| `EMAIL_FROM` | Expéditeur des emails |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (ex. `https://jocuts.vercel.app`) |

Sans `RESEND_API_KEY`, les emails sont loggés dans la console en développement.

## Structure

```
src/
├── app/              # Pages publiques + admin + API
├── components/       # UI partagée
└── lib/              # Prisma, auth, métier
prisma/
├── schema.prisma
└── migrations/
public/
├── images/gallery/   # Photos seed
└── uploads/gallery/  # Uploads admin (gitignored)
```

## Fonctionnalités

- Site public : accueil, services, galerie, contact, prise de RDV
- Back-office : services, calendrier, disponibilités, validation RDV, CRM clients, galerie
- Notifications email (Resend) : nouvelle demande, confirmation, refus

## Déploiement (Vercel)

1. Pousser le repo sur GitHub : [nolanecaliari97231-glitch/jo-cuts](https://github.com/nolanecaliari97231-glitch/jo-cuts)
2. Importer le projet sur [Vercel](https://vercel.com) depuis GitHub
3. Configurer les variables d'environnement (voir ci-dessus)
4. **Base de données** : SQLite ne persiste pas sur Vercel. Pour la production, migrer vers **PostgreSQL** (Neon ou Supabase) et adapter `DATABASE_URL` + le client Prisma.
5. Après le premier déploiement, exécuter les migrations et le seed sur la base de prod :
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
6. Les uploads galerie (`public/uploads/`) ne persistent pas non plus sur Vercel — prévoir un stockage objet (S3, Cloudinary, Supabase Storage) en production.

Build Vercel : `npm run build` (inclut `prisma generate`).

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migrations Prisma (dev) |
| `npm run db:seed` | Données initiales (staff, services, galerie) |

## Roadmap (specs §6)

1. ~~Setup projet~~
2. ~~Modèle de données Prisma~~
3. ~~Front public~~
4. ~~Auth back-office~~
5. ~~CRUD services~~
6. ~~Calendrier + disponibilités~~
7. ~~Parcours prise de RDV~~
8. ~~Validation demandes + notifications~~
9. ~~Dashboard + CRM léger~~
10. ~~Galerie dynamique~~
11. ~~Tests + déploiement (doc & push GitHub)~~
12. Phase 2 : SumUp, espace client, PostgreSQL prod, stockage photos cloud

## Identité visuelle

- Palette gris charbon / blanc cassé
- Typo : Playfair Display (logo) + Inter (contenu)
- Icône : ciseaux croisés
