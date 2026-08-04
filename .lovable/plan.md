# Accueil : remplacer les statistiques par « Notre processus »

## Ce qui change

1. **Suppression du bandeau de statistiques** de la page d'accueil (les chiffres 1 200+, 58, 18, 97 %). Il disparaît complètement de l'accueil ; les 3 chiffres de la section « Qui sommes-nous ? » ne sont pas touchés.
2. **La section « Notre processus » prend cette place**, juste après « Qui sommes-nous ? », à l'emplacement exact de l'ancien bandeau.
3. **La version enrichie est reprise** : badge circulaire avec icône (Brief & audit, Conception 3D, Fabrication, Pose & SAV), halo orange-rouge et connecteur en dégradé reliant les 4 étapes sur grand écran — identique au style du Hero.
4. **Suppression du doublon** : l'ancienne section « Notre processus » plus bas dans la page d'accueil est retirée.
5. **La page Services garde sa section Méthodologie** inchangée.

## Détails techniques

- `src/routes/index.tsx` : retirer la section « Chiffres clés » et l'ancienne section processus ; insérer la nouvelle section processus après « Qui sommes-nous ? ».
- Extraire la mise en page des 4 étapes dans `src/components/ProcessSteps.tsx` (icônes lucide-react `ClipboardList`, `PenTool`, `Factory`, `ShieldCheck`, connecteur en dégradé, cartes `glass`), utilisé par l'accueil et par `src/routes/services.tsx` pour éviter la duplication de code.
- Les données restent celles de `process` dans `src/lib/site-data.ts`.
- La requête `site-settings` reste utilisée pour le CTA ; la partie `stats` n'est plus lue sur l'accueil (l'onglet Réglages admin reste inchangé).
