# Capture de leads : formulaire de devis + newsletter branchés en base

## Objectif

Aujourd'hui le formulaire de contact et le bloc newsletter n'envoient rien : la soumission affiche seulement un message de succès côté navigateur. Chaque demande est donc perdue. On enregistre désormais chaque demande en base, avec consultation dans l'espace admin.

## Ce qui sera fait

### 1. Enregistrement des demandes de devis
- Nouvelle table `contact_messages` : nom, email, téléphone, service souhaité, message, statut de suivi (nouveau / en cours / traité / archivé), date.
- Le formulaire Contact envoie réellement la demande, affiche un état "envoi en cours", un message de succès seulement après enregistrement confirmé, et un message d'erreur clair en cas d'échec (avec repli vers WhatsApp).
- Le piège anti-spam (honeypot) est revalidé côté serveur, en plus des règles de longueur/format déjà en place.
- Le visiteur (non connecté) peut envoyer, mais ne peut jamais lire les demandes ; seuls les administrateurs y accèdent.

### 2. Newsletter
- Nouvelle table `newsletter_subscribers` : email, date, statut. Un même email ne peut s'inscrire qu'une fois (réinscription sans erreur visible).
- Le bloc newsletter du pied de page Contact enregistre réellement l'email et confirme l'inscription.

### 3. Espace admin — onglet « Demandes »
- Nouvel onglet dans l'admin listant les demandes de devis, les plus récentes en premier : nom, service, date, message, contact cliquable (email / téléphone / WhatsApp).
- Changement de statut en un clic et suppression d'une demande.
- Compteur des demandes non lues sur l'onglet.
- Petite liste des inscrits newsletter avec export texte simple (copie des emails).

### 4. Numéro de téléphone
- La page Contact affiche encore `+213 00 00 00 00` (lien `tel:+213000000000`) : remplacé par `+213 540 48 18 10`, cohérent avec le pied de page et le bouton WhatsApp.

## Détails techniques

- Migration Lovable Cloud : deux tables avec `GRANT` explicites, RLS activée, trigger `set_updated_at`.
  - `contact_messages` : insertion autorisée pour `anon` + `authenticated` ; lecture / mise à jour / suppression réservées à `has_role(auth.uid(), 'admin')`.
  - `newsletter_subscribers` : insertion autorisée pour `anon` + `authenticated`, contrainte d'unicité sur l'email (upsert silencieux) ; lecture réservée aux admins.
- Serveur : nouvelles fonctions dans `src/lib/leads.functions.ts` (`createServerFn`) — `submitContactMessage`, `subscribeNewsletter` (publiques, validation Zod côté serveur, client publishable), plus `listContactMessages`, `updateContactMessageStatus`, `deleteContactMessage`, `listNewsletterSubscribers` protégées par `requireSupabaseAuth` + vérification du rôle admin, comme dans `content.functions.ts`.
- Front : `src/routes/contact.tsx` passe en soumission asynchrone (état idle / sending / success / error) ; l'admin (`src/routes/_authenticated/admin.tsx`) reçoit l'onglet « Demandes » via TanStack Query.
- Pas d'edge function ni d'email : l'option base de données est retenue. Une notification email pourra être ajoutée ensuite si besoin.
