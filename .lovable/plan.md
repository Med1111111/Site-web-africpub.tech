# Indicateur de progression pour l'upload de la pièce jointe

Objectif : pendant l'envoi du formulaire de devis, afficher une vraie barre de progression du transfert du fichier vers le stockage, puis un état de chargement clair pour l'enregistrement de la demande.

## Ce que verra l'utilisateur

1. Clic sur « Envoyer la demande » avec un fichier joint :
   - la zone de dépôt affiche une barre de progression fine (dégradé rouge/orange, style glass existant) qui passe de 0 % à 100 %,
   - le pourcentage et la taille transférée (ex. « 2,4 Mo / 6,1 Mo ») s'affichent à droite du nom du fichier,
   - un bouton « Annuler » discret permet d'interrompre le transfert.
2. Une fois le fichier à 100 % : la barre passe en état « Fichier envoyé » (coche), et le bouton affiche « Enregistrement de la demande… » avec un petit spinner.
3. Sans fichier : comportement inchangé, simple « Envoi en cours… » avec spinner.
4. Erreur d'upload : message clair sous le champ (« L'envoi du fichier a échoué, réessayez ») avec possibilité de renvoyer sans perdre les champs saisis.
5. Le bouton reste désactivé pendant tout le processus ; les états sont annoncés aux lecteurs d'écran (`role="status"`, `aria-live="polite"`, `progressbar` avec `aria-valuenow`).

## Détails techniques

- `supabase.storage.uploadToSignedUrl()` n'expose aucun événement de progression. Remplacement, uniquement pour ce champ, par un `XMLHttpRequest` PUT vers l'URL d'upload signée (`{SUPABASE_URL}/storage/v1/object/upload/sign/lead-attachments/{path}?token={token}`), avec `xhr.upload.onprogress` pour le pourcentage réel et `xhr.abort()` pour l'annulation. La fonction serveur `createLeadUploadUrl` reste inchangée (elle renvoie déjà `path` + `token`).
- Nouvel utilitaire `uploadWithProgress()` placé dans `src/lib/leads-upload.ts` (module déjà partagé client/serveur, sans dépendance serveur) : prend le fichier, le chemin, le token, un callback de progression et un `AbortSignal`.
- `src/routes/contact.tsx` : la machine d'états passe de `"uploading"` à `{ phase: "uploading", loaded, total }`, plus un état `"submitting"` pour l'appel `submitContactMessage`. Ajout d'un petit composant local de barre de progression et d'un spinner (icône `Loader2` de lucide-react, animation `animate-spin`).
- Aucune modification de la base, du bucket, des politiques RLS, ni du reste de la page.
- Vérification : test manuel via l'aperçu avec un fichier de plusieurs Mo (progression visible, annulation, succès), plus un passage Playwright rapide pour confirmer qu'aucune régression n'apparaît sur `/contact` (CSP incluse — l'appel XHR reste sur l'origine du backend déjà autorisée par `connect-src`).
