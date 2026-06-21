# JO'Cuts — Spécifications du site web

Document de base pour le développement avec Cursor. Barbershop basé en Martinique, 1 barbier actuellement (extensible à plusieurs employés).

---

## 1. Identité de marque

- **Nom** : JO'Cuts
- **Slogan / tagline** : Barbershop — Martinique
- **Palette** : gris (neutre, sobre), avec accents noir/blanc
- **Typo** : serif classique pour le logo (ex: Georgia, Playfair Display), sans-serif pour le contenu (ex: Inter, Poppins)
- **Icône** : ciseaux (motif récurrent dans le logo et les éléments graphiques)
- **Ton** : soigné, familial, classique — pas "street/hype"

---

## 2. Pages du site (front-end public)

### 2.1 Accueil
- Hero avec logo, accroche, photo/visuel du salon ou d'une coupe
- Bouton principal "Prendre rendez-vous"
- Aperçu des services (3-4 mis en avant)
- Avis clients (si disponibles, sinon prévoir la structure pour plus tard)
- Localisation (carte) + horaires d'ouverture
- Lien réseaux sociaux (Instagram notamment)

### 2.2 Services
- Liste complète des prestations avec :
  - Nom du service
  - Description courte
  - Durée
  - Prix
- Catégories suggérées : Coupe homme / Coupe enfant / Barbe / Combo coupe + barbe / Autres (coloration, soins...)

### 2.3 Galerie
- Grille de photos des réalisations (avant/après si possible)
- Peut être alimentée manuellement par le barbier via le back-office (upload simple)

### 2.4 Prise de rendez-vous (cœur du site)
Parcours client :
1. Choix du service (parmi la liste définie en back-office)
2. Affichage du calendrier avec les créneaux disponibles (en fonction des horaires + RDV déjà pris)
3. Sélection du créneau souhaité
4. Formulaire coordonnées client : nom, téléphone, email (email optionnel si SMS suffit)
5. Validation de la demande → **statut "en attente"**
6. Confirmation à l'écran : "Votre demande a été envoyée, vous recevrez une confirmation"
7. Notification envoyée au barbier (email et/ou SMS) avec le détail de la demande
8. Le barbier confirme ou refuse depuis le back-office (cf. section 3)
9. Le client reçoit une confirmation ou un message de refus/proposition d'un autre créneau (email/SMS)

### 2.5 Contact
- Adresse, téléphone, email
- Formulaire de contact simple
- Carte (Google Maps embed)
- Horaires d'ouverture

### 2.6 (Optionnel, phase 2) Espace client
- Historique des RDV passés
- Reprise de RDV rapide ("reprendre le même service")
- Non prioritaire pour le lancement — à prévoir en V2

---

## 3. Back-office barbier (espace privé, protégé par login)

### 3.1 Authentification
- Login sécurisé (email + mot de passe, hashé)
- Session protégée, déconnexion automatique après inactivité
- Mot de passe oublié → réinitialisation par email

### 3.2 Dashboard / vue d'ensemble
- RDV du jour en évidence
- Nombre de demandes en attente de validation
- Raccourcis vers calendrier et gestion des services

### 3.3 Calendrier personnel
- Vue **jour / semaine / mois**
- Chaque RDV affiche : heure, client, service, durée, statut (en attente / confirmé / refusé / terminé / annulé)
- Code couleur par statut pour s'y retrouver vite
- Clic sur un RDV → détail + actions (confirmer, refuser, modifier l'heure, annuler, marquer comme terminé)
- Vue agenda condensée pour repérer les trous dans la journée

### 3.4 Gestion des demandes de RDV
- Liste des demandes "en attente" mises en avant (notification visuelle, badge)
- Action rapide : Confirmer / Refuser / Proposer un autre créneau
- Historique des RDV passés (filtrable par date, client, statut)

### 3.5 Gestion des disponibilités
- Définir les horaires d'ouverture par jour de la semaine
- Bloquer des créneaux ponctuels (congés, rendez-vous personnel, jours fériés)
- Définir la durée de chaque service (utilisée pour calculer les créneaux disponibles côté client)

### 3.6 Gestion des services
- Ajouter / modifier / supprimer un service (nom, description, durée, prix, catégorie)
- Activer/désactiver un service temporairement

### 3.7 Gestion des clients (CRM léger)
- Liste des clients ayant déjà pris RDV
- Fiche client : coordonnées, historique des RDV, notes internes (ex: "préfère le dégradé court")

### 3.8 Gestion de la galerie
- Upload/suppression de photos pour la galerie publique

### 3.9 (Phase 2 / extensibilité) Multi-barbiers
- La base de données est structurée dès le départ pour supporter plusieurs barbiers (table `staff` séparée de `appointments`), même si un seul est actif au lancement
- Permettrait plus tard : calendrier par employé, attribution d'un service à un barbier spécifique

---

## 4. Modèle de données (base de données)

Structure relationnelle recommandée (PostgreSQL ou SQLite pour démarrer) :

### `staff` (barbiers — même à 1 seul au début)
| Champ | Type | Description |
|---|---|---|
| id | UUID/PK | |
| name | string | |
| email | string | login |
| password_hash | string | |
| phone | string | |
| created_at | datetime | |

### `services`
| Champ | Type | Description |
|---|---|---|
| id | UUID/PK | |
| name | string | ex: "Coupe homme" |
| description | text | |
| duration_minutes | integer | |
| price | decimal | |
| category | string | |
| active | boolean | |

### `clients`
| Champ | Type | Description |
|---|---|---|
| id | UUID/PK | |
| name | string | |
| phone | string | |
| email | string (nullable) | |
| notes | text (nullable) | |
| created_at | datetime | |

### `appointments`
| Champ | Type | Description |
|---|---|---|
| id | UUID/PK | |
| client_id | FK → clients | |
| staff_id | FK → staff | |
| service_id | FK → services | |
| start_time | datetime | |
| end_time | datetime | calculé à partir de la durée du service |
| status | enum | pending / confirmed / refused / cancelled / completed |
| created_at | datetime | |
| notes | text (nullable) | |

### `availability` (horaires d'ouverture récurrents)
| Champ | Type | Description |
|---|---|---|
| id | UUID/PK | |
| staff_id | FK → staff | |
| day_of_week | integer (0-6) | |
| start_time | time | |
| end_time | time | |

### `blocked_slots` (congés, indisponibilités ponctuelles)
| Champ | Type | Description |
|---|---|---|
| id | UUID/PK | |
| staff_id | FK → staff | |
| start_datetime | datetime | |
| end_datetime | datetime | |
| reason | string (nullable) | |

---

## 5. Stack technique recommandée

Pour un développement rapide avec Cursor, voici une stack moderne et cohérente :

| Couche | Choix recommandé | Pourquoi |
|---|---|---|
| Front-end | **Next.js** (React) | SSR/SEO pour la partie publique, routing simple, écosystème énorme |
| Style | **Tailwind CSS** | Rapide à styliser, cohérent avec la palette grise définie |
| Back-end | API routes Next.js ou **Node.js/Express** séparé | Simplicité si tout en Next.js |
| Base de données | **PostgreSQL** (via Supabase ou Neon) ou SQLite pour prototyper vite | Supabase offre auth + DB + storage en un seul service, bon compromis rapidité/robustesse |
| ORM | **Prisma** | Migrations propres, types générés automatiquement |
| Authentification | **NextAuth.js** ou auth Supabase | Évite de coder le login à la main |
| Hébergement | **Vercel** (front) + **Supabase** (DB/storage) | Gratuit pour démarrer, scalable |
| Notifications email | **Resend** ou **SendGrid** | Confirmation de RDV par email |
| Notifications SMS (optionnel) | **Twilio** | Si confirmation par SMS souhaitée |
| Calendrier (UI) | **FullCalendar** (react) ou composant custom avec **date-fns** | FullCalendar gère déjà vue jour/semaine/mois |

### Pourquoi cette stack pour Cursor
- Next.js + Prisma + Supabase est un combo très documenté → Cursor (et les LLM en général) génèrent du code fiable sur cette stack
- Permet de déployer rapidement une V1 fonctionnelle puis d'itérer

---

## 6. Plan de développement suggéré (par étapes)

1. **Setup projet** : Next.js + Tailwind + Prisma + connexion Supabase
2. **Modèle de données** : créer le schema Prisma à partir de la section 4, migrer
3. **Front public statique** : Accueil, Services, Galerie, Contact (sans logique dynamique au début)
4. **Authentification back-office** : login barbier
5. **CRUD Services** : gestion des prestations depuis le back-office
6. **Calendrier + disponibilités** : configuration des horaires, blocage de créneaux
7. **Parcours de prise de RDV** : logique de calcul des créneaux disponibles + formulaire client
8. **Gestion des demandes** : validation manuelle côté barbier + notifications email
9. **Dashboard et CRM léger** : vue d'ensemble, fiche client, historique
10. **Galerie dynamique** : upload de photos depuis le back-office
11. **Tests + déploiement** : Vercel + domaine personnalisé
12. **Phase 2 (optionnel)** : espace client, multi-barbiers, SMS, paiement en ligne/acompte

---

## 7. Points à valider avec le cousin avant de lancer le dev

- Liste définitive des services + prix + durées
- Horaires d'ouverture habituels
- Adresse exacte du salon (pour la carte et le contact)
- Nom de domaine souhaité (ex: jocuts.com, jocuts.fr, jocutsmartinique.com)
- Réseaux sociaux à lier (Instagram actuel : à migrer/renommer si le nom change)
- Préférence de notification : email seul, SMS seul, ou les deux
