# Déploiement JO'Cuts — Neon + Vercel

Guide pas à pas pour mettre le site en production.

## 1. Base de données Neon (PostgreSQL)

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Nouveau projet → région proche (ex. **EU West**)
3. Copier la connection string **Pooled** (contient `-pooler` dans l'hostname)
4. Format : `postgresql://user:pass@ep-xxx-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`

## 2. Vercel Blob (photos galerie)

1. Sur [vercel.com](https://vercel.com) → projet → **Storage** → **Blob**
2. Créer un store (ex. `jocuts-gallery`)
3. Copier le token `BLOB_READ_WRITE_TOKEN`

Sans Blob, les uploads galerie ne fonctionnent pas en production (filesystem éphémère).

## 3. Resend (emails — optionnel)

1. [resend.com](https://resend.com) → API Keys
2. Vérifier un domaine d'envoi ou utiliser `onboarding@resend.dev` pour tester
3. `RESEND_API_KEY` + `EMAIL_FROM`

## 4. Importer sur Vercel

1. [vercel.com/new](https://vercel.com/new) → Import **jo-cuts** depuis GitHub
2. Framework : Next.js (détecté automatiquement)
3. Ajouter les variables d'environnement :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL pooled Neon |
| `AUTH_SECRET` | Chaîne aléatoire longue (32+ caractères) |
| `STAFF_EMAIL` | Email admin barbier |
| `STAFF_PASSWORD` | Mot de passe initial |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-projet.vercel.app` |
| `BLOB_READ_WRITE_TOKEN` | Token Vercel Blob |
| `RESEND_API_KEY` | (optionnel) |
| `EMAIL_FROM` | (optionnel) |

4. Deploy

Le build exécute automatiquement `prisma migrate deploy` (voir `vercel.json`).

## 5. Seed initial (première fois)

Après le premier déploiement, initialiser les données depuis votre machine :

```bash
# Pointer DATABASE_URL vers Neon (pas localhost)
export DATABASE_URL="postgresql://...pooler.neon.tech/..."
export AUTH_SECRET="..."
export STAFF_EMAIL="..."
export STAFF_PASSWORD="..."

npm run db:seed
```

Cela crée : compte barbier, services, horaires, galerie par défaut.

## 6. Développement local

```bash
docker compose up -d          # PostgreSQL local
cp .env.example .env          # DATABASE_URL postgresql://jocuts:jocuts@localhost:5432/jocuts
npm install
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

## 7. Vérifications post-déploiement

- Site public : `/`, `/services`, `/galerie`, `/rendez-vous`
- Admin : `/admin/login`
- Créer une demande RDV → notification email (console ou Resend)
- Confirmer RDV depuis `/admin/appointments`
- Upload photo galerie depuis `/admin/gallery`

## Région Vercel

Le projet est configuré pour **`cdg1`** (Paris) dans `vercel.json`.
