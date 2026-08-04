# SEO enrichi : Services & Portfolio

Objectif : donner aux pages Services et Portfolio des balises meta complètes et des données structurées (JSON-LD) pour améliorer le référencement et l'aperçu lors des partages sur les réseaux sociaux.

## Ce qui change

### Page Services (`/services`)
- Meta complètes : titre, description, `og:title`, `og:description`, `og:type`, `og:url` absolu, `twitter:card`, `twitter:title`, `twitter:description`.
- Image de partage : `og:image` + `twitter:image` pointant vers l'image d'enseigne lumineuse déjà utilisée sur la page (URL CDN absolue).
- Canonical absolu vers `https://premium-afric-vision.lovable.app/services`.
- JSON-LD :
  - `ItemList` listant les 10 services (position, nom, description, image) — permet à Google de comprendre l'offre.
  - `BreadcrumbList` : Accueil › Services.

### Page Portfolio (`/portfolio`)
- Mêmes meta complètes (titre, description, og:*, twitter:*), `og:url` et canonical absolus.
- Image de partage : première réalisation / visuel du stand (URL absolue).
- JSON-LD :
  - `CollectionPage` + `ItemList` des réalisations statiques (titre, catégorie, ville).
  - `BreadcrumbList` : Accueil › Portfolio.

### Cohérence globale
- Les URLs `og:url` et `canonical` des autres pages (`/faq`, `/a-propos`) sont aujourd'hui relatives : elles passent en absolues pour éviter que les crawlers attribuent le contenu à la mauvaise URL.
- `public/sitemap.xml` : les `<loc>` relatifs deviennent absolus (requis par la spécification sitemap).

## Détails techniques
- Tout passe par l'option `head()` de `createFileRoute` (meta, links, scripts) — pas de nouvelle dépendance.
- Le JSON-LD du Portfolio est construit à partir des données statiques `projects` de `src/lib/site-data.ts` (rendu SSR fiable), et non des données admin chargées côté client, car `head()` ne peut pas dépendre d'une requête client.
- Aucun changement de logique métier ni de mise en page ; uniquement des métadonnées.

## Note
Les aperçus déjà mis en cache par Facebook/LinkedIn/WhatsApp ne se rafraîchissent pas immédiatement ; un passage par le débogueur d'aperçu de chaque plateforme force la mise à jour.
