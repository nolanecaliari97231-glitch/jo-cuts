# JO'Cuts — Site web barbershop

Site vitrine + prise de rendez-vous + back-office barbier pour **JO'Cuts**, barbershop en Martinique.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Prisma 7** + **PostgreSQL** (Neon en prod, Docker en local)
- **Vercel** + **Vercel Blob** (hébergement + photos galerie)
- Specs complètes : [`JOCuts-specs.md`](./JOCuts-specs.md)
- Déploiement détaillé : [`DEPLOY.md`](./DEPLOY.md)

## Démarrage local

```bash
git clone https://github.com/nolanecaliari97231-glitch/jo-cuts.git
cd jo-cuts
docker compose up -d
npm install
cp .env.example .env
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

- Site : [http://localhost:3000](http://localhost:3000)
- Admin : [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL (`postgresql://jocuts:jocuts@localhost:5432/jocuts` en local) |
| `AUTH_SECRET` | Clé secrète JWT (longue chaîne aléatoire) |
| `STAFF_EMAIL` / `STAFF_PASSWORD` | Compte admin (seed) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (prod — uploads galerie) |
| `RESEND_API_KEY` / `EMAIL_FROM` | Emails (optionnel en dev) |

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run db:local` | Démarrer PostgreSQL Docker |
| `npm run db:migrate:deploy` | Appliquer les migrations |
| `npm run db:seed` | Données initiales |
| `npm run lint` | ESLint |

## Déploiement production

Voir **[DEPLOY.md](./DEPLOY.md)** pour Neon + Vercel + Blob + seed.

Résumé :
1. Créer base **Neon** (URL pooler)
2. Créer store **Vercel Blob**
3. Importer repo sur **Vercel** avec les variables d'env
4. Lancer `npm run db:seed` une fois contre la base Neon

## Fonctionnalités

- Site public : accueil, services, galerie, contact, prise de RDV
- Back-office : services, calendrier, disponibilités, validation RDV, CRM, galerie
- Notifications email (Resend)

## Roadmap

- ~~Setup → Galerie dynamique~~
- ~~PostgreSQL + Vercel~~
- Phase 2 : SumUp, espace client

## Identité visuelle

- Palette gris charbon / blanc cassé
- Typo : Playfair Display (logo) + Inter (contenu)
- Icône : ciseaux croisés
