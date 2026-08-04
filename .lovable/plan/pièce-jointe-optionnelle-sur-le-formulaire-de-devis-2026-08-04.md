# Pièce jointe optionnelle sur le formulaire de devis

## Ce que verra le visiteur

Entre le champ « Votre projet » et le bouton « Envoyer la demande », un nouveau champ optionnel :

- Libellé : **Joindre votre logo / photo de la façade** avec la précision *(vectoriel, photo ou plan 3D)*.
- Zone de dépôt au style identique aux autres champs (fond glass-soft, coins arrondis, glow au focus), cliquable et compatible glisser-déposer.
- Une fois un fichier choisi : affichage du nom et de la taille, plus un bouton « Retirer ».
- Formats acceptés : .ai, .eps, .svg, .pdf, .jpg, .jpeg, .png, .webp, .obj, .skp, .dwg. Taille max 10 Mo.
- Message d'erreur clair sous le champ si le format ou la taille ne conviennent pas (« Format non accepté… », « Fichier trop lourd (max 10 Mo) »), sans bloquer le reste du formulaire.
- Champ totalement facultatif : l'envoi sans fichier fonctionne exactement comme aujourd'hui.

## Côté administration

Dans l'onglet « Demandes » du tableau de bord, chaque demande avec pièce jointe affiche un bouton « Pièce jointe » qui ouvre le fichier dans un nouvel onglet (lien temporaire sécurisé, valable 1 heure). Les demandes sans fichier restent inchangées.

## Détails techniques

- **Stockage** : nouveau bucket privé `lead-attachments` (créé via l'outil dédié). Aucun accès public direct ; les fichiers ne sont lisibles que par le serveur et via un lien signé généré pour les admins.
- **Base** : migration ajoutant `attachment_path text not null default ''` et `attachment_name text not null default ''` à `public.contact_messages` (rétro-compatible, aucune donnée existante impactée).
- **Upload sécurisé** : nouvelle fonction serveur publique `createLeadUploadUrl` dans `src/lib/leads.functions.ts` — elle valide extension + taille annoncée, applique le throttling existant (`allowLeadAttempt`, catégorie `upload`, 5/heure), puis renvoie une URL d'upload signée générée avec le client service role. Le navigateur envoie le fichier directement via `uploadToSignedUrl`, ce qui évite de faire transiter 10 Mo par le RPC TanStack.
- `submitContactMessage` accepte deux nouveaux champs optionnels (`attachmentPath`, `attachmentName`), revalidés côté serveur (préfixe de chemin attendu, longueur bornée) avant insertion.
- **Admin** : fonction serveur protégée `getLeadAttachmentUrl` (middleware `requireSupabaseAuth`) renvoyant une URL signée ; `LeadsManager.tsx` ajoute le bouton d'ouverture.
- **Front** : `src/routes/contact.tsx` gère l'état du fichier (sélection, validation client, upload avant soumission, état « Envoi du fichier… »), sans toucher au reste de la page ni au design existant.
- Aucune modification des autres sections, styles ou routes.
