# Portfolio : 6 visuels IA dédiés + titres honnêtes

## Objectif
Remplacer les 3 images placeholder recyclées par 6 visuels générés (un par réalisation), dans le style sombre premium néon rouge/orange du site, et renommer les titres pour qu'ils ne laissent plus croire à des cas clients réels documentés.

## Nouveaux visuels (6 images, 1024x768 comme l'existant)
Chaque image en ambiance nocturne, noir profond, éclairage néon rouge/orange, fort contraste, sans texte lisible ni logo de marque réelle :
1. Enseigne LED — lettres boîtiers rouges rétroéclairées sur façade de boutique la nuit
2. Signalétique intérieure — totems et panneaux directionnels lumineux dans un hall sombre
3. Covering de véhicules — utilitaires floqués rouge/noir dans un parking éclairé
4. Stand d'exposition — stand modulaire illuminé rouge, salon professionnel
5. Totem lumineux — totem vertical LED en extérieur nocturne
6. Habillage de façade — bardage composite à facettes avec liseré lumineux rouge

Ces images sont générées puis référencées comme assets du projet (mêmes dimensions, même ratio → aucune modification de mise en page).

## Renommage des titres (`src/lib/site-data.ts`)
| Actuel | Nouveau |
| --- | --- |
| Enseigne LED — Retail Alger | Enseigne LED sur mesure |
| Signalétique complète — Campus | Signalétique intérieure premium |
| Covering flotte — Logistique | Covering de flotte professionnelle |
| Stand salon 120 m² | Stand d'exposition modulaire |
| Totem lumineux — Station | Totem lumineux extérieur |
| Habillage façade — Banque | Habillage de façade composite |

Les catégories (Enseignes, Signalétique, Véhicules, Grand format) restent inchangées pour ne pas casser les filtres. Le champ `city` — qui renforce l'impression de cas client réel — est retiré de l'affichage et remplacé par la catégorie dans la lightbox et sur l'accueil.

Une mention discrète sous le titre de la page Portfolio précise qu'il s'agit de visuels d'illustration de nos savoir-faire.

## Détails techniques
- Chaque réalisation porte désormais son propre visuel : le tableau `projects` de `src/lib/site-data.ts` gagne un champ `image` (+ `alt`), au lieu du tableau `images` recyclé modulo 3 dans `portfolio.tsx` et `index.tsx`.
- `src/routes/portfolio.tsx` et `src/routes/index.tsx` consomment `p.image` / `p.alt` ; le repli sur les données admin Supabase (`listPublicPortfolio`) reste prioritaire quand des éléments sont publiés.
- Le JSON-LD `CollectionPage` du Portfolio est mis à jour : nouveaux titres, nouvelles images absolues ; `locationCreated` est supprimé puisque les villes ne sont plus revendiquées.
- Le sous-texte de la page (`sub`) et les résultats de `/recherche` reprennent automatiquement les nouveaux titres.
- Les anciens `portfolio-1/2/3.jpg` sont supprimés une fois qu'aucun import ne les référence.
