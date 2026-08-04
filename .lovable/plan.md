# Portfolio : remplacer les visuels IA par vos photos réelles

## Ce qui change
Les 6 réalisations affichent vos propres photos, une par catégorie, au même format 1024x768 (4:3) que les images actuelles — aucune modification de mise en page.

## Association photo / réalisation

| # | Réalisation (titre) | Catégorie | Photo uploadée |
| --- | --- | --- | --- |
| 1 | Enseigne LED sur mesure | Enseignes | Lettres boîtiers noir/or rétroéclairées et perforées |
| 2 | Totem lumineux extérieur | Enseignes | Totem noir/orange multi-marques |
| 3 | Signalétique intérieure premium | Signalétique | Mur de panneaux décoratifs 3D ajourés (découpe CNC) |
| 4 | Covering de flotte professionnelle | Véhicules | Utilitaire floqué vert/blanc + planche de covering |
| 5 | Impression grand format | Grand format | Impression numérique en cours sur traceur (bâche burger) |
| 6 | Packaging & étiquettes | Grand format | Étiquettes imprimées en planche + boîtes personnalisées |

Deux titres évoluent (5 et 6) car les photos fournies illustrent l'impression et le packaging plutôt qu'un stand ou une façade. Les catégories du filtre restent inchangées.

Les deux photos non retenues (dépliant 3 volets rouge/noir, macro de vinyle micro-perforé) restent disponibles si vous préférez les substituer à un des choix ci-dessus.

## Détails techniques
- Les 6 photos sont recadrées en 1024x768 (recadrage centré, qualité conservée) et enregistrées dans `src/assets/realisation-*.jpg`, ce qui garde la chaîne d'optimisation existante : `vite-imagetools` regénère les variantes AVIF/WebP en 480/768/1024 px.
- `src/lib/site-data.ts` : mêmes clés (`image`, `avif`, `webp`, `alt`, `title`, `category`), seuls les fichiers, deux titres et les textes alternatifs changent. Les textes alternatifs décrivent la photo réelle.
- `src/routes/portfolio.tsx` et `src/routes/index.tsx` ne changent pas (même structure de données), sauf le JSON-LD qui reprend automatiquement les nouveaux titres/images.
- Le preload AVIF de la première vignette et le lazy loading restent en place.
- Les anciens visuels IA `realisation-*.jpg` sont écrasés par les nouveaux fichiers, donc aucun asset orphelin.
- La mention « Visuels d'illustration représentatifs de nos prestations » du sous-titre est remplacée par « Quelques-unes de nos réalisations », puisqu'il s'agit désormais de photos réelles.
