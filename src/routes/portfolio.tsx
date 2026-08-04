import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { listPublicPortfolio } from "@/lib/content.functions";
import { ResponsiveImage } from "@/components/ResponsiveImage";

import { categories, projects } from "@/lib/site-data";
import stand from "@/assets/stand.jpg.asset.json";


const SITE_URL = "https://premium-afric-vision.lovable.app";
const PORTFOLIO_URL = `${SITE_URL}/portfolio`;
const PORTFOLIO_TITLE = "Portfolio — Réalisations Afric Pub en Algérie";
const PORTFOLIO_DESC =
  "Découvrez nos réalisations : enseignes lumineuses, signalétique, covering de flotte, stands et habillage de façade livrés dans toute l'Algérie.";
const PORTFOLIO_IMAGE = `${SITE_URL}${stand.url}`;

export const Route = createFileRoute("/portfolio")({
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: PORTFOLIO_TITLE },
      { name: "description", content: PORTFOLIO_DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: PORTFOLIO_TITLE },
      { property: "og:description", content: PORTFOLIO_DESC },
      { property: "og:url", content: PORTFOLIO_URL },
      { property: "og:image", content: PORTFOLIO_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: PORTFOLIO_TITLE },
      { name: "twitter:description", content: PORTFOLIO_DESC },
      { name: "twitter:image", content: PORTFOLIO_IMAGE },
    ],
    links: [
      { rel: "canonical", href: PORTFOLIO_URL },
      // Précharge la première vignette (candidat LCP), en AVIF responsive.
      {
        rel: "preload",
        as: "image",
        href: projects[0].image,
        imagesrcset: projects[0].avif,
        imagesizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
        type: "image/avif",
        fetchpriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${PORTFOLIO_URL}#collectionpage`,
          name: PORTFOLIO_TITLE,
          description: PORTFOLIO_DESC,
          url: PORTFOLIO_URL,
          inLanguage: "fr",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          primaryImageOfPage: { "@type": "ImageObject", url: PORTFOLIO_IMAGE },
          mainEntity: {
            "@type": "ItemList",
            name: "Réalisations Afric Pub",
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            numberOfItems: projects.length,
            itemListElement: projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.title,
              item: {
                "@type": "CreativeWork",
                "@id": `${PORTFOLIO_URL}#realisation-${i + 1}`,
                name: p.title,
                url: PORTFOLIO_URL,
                image: `${SITE_URL}${p.image}`,
                genre: p.category,
                creator: { "@id": `${SITE_URL}/#organization` },
              },
            })),
          },
        }),

      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Portfolio", item: PORTFOLIO_URL },
          ],
        }),
      },
    ],
  }),
});

function PortfolioPage() {
  const [filter, setFilter] = useState("Tous");
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Réalisations gérées depuis l'espace admin, repli sur le contenu statique.
  const { data } = useQuery({ queryKey: ["public-portfolio"], queryFn: () => listPublicPortfolio() });

  const items =
    data && data.length > 0
      ? data.map((p, i) => ({
          title: p.title,
          category: p.category,
          img: p.image_url || projects[i % projects.length].image,
          avif: p.image_url ? undefined : projects[i % projects.length].avif,
          webp: p.image_url ? undefined : projects[i % projects.length].webp,
          alt: p.title,
        }))
      : projects.map((p) => ({
          title: p.title,
          category: p.category,
          img: p.image,
          avif: p.avif,
          webp: p.webp,
          alt: p.alt,
        }));



  const visible = items
    .map((p, i) => ({ ...p, index: i }))
    .filter((p) => filter === "Tous" || p.category === filter);

  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Portfolio"
        title="Nos réalisations"
        sub="Un aperçu de nos savoir-faire : enseignes, signalétique, covering et grand format. Visuels d'illustration représentatifs de nos prestations."
      />

      <section className="mx-auto mt-12 max-w-7xl">
        <Reveal>
          <div role="tablist" aria-label="Filtrer par catégorie" className="flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`min-h-11 rounded-full px-5 py-2.5 text-sm transition-colors ${
                  filter === c ? "bg-brand text-primary-foreground" : "glass-soft text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <Reveal as="li" key={`${p.title}-${i}`} delay={i * 60}>
              <button
                onClick={() => setLightbox(p.index)}
                className="group block w-full overflow-hidden rounded-3xl glass p-2 text-left card-3d"
                aria-label={`Agrandir : ${p.title}`}
              >
                <ResponsiveImage
                  src={p.img}
                  avif={p.avif}
                  webp={p.webp}
                  alt={p.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-60 w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <span className="flex items-center justify-between px-3 py-4">
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="rounded-full glass-soft px-3 py-1 text-xs text-muted-foreground">{p.category}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </section>

      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={items[lightbox].title}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <div className="w-full max-w-3xl rounded-3xl glass p-3" onClick={(e) => e.stopPropagation()}>
            <ResponsiveImage
              src={items[lightbox].img}
              avif={items[lightbox].avif}
              webp={items[lightbox].webp}
              alt={items[lightbox].alt}
              loading="eager"
              sizes="(min-width: 768px) 768px, 100vw"
              className="w-full rounded-2xl object-cover"
            />

            <div className="flex items-center justify-between px-3 py-4">
              <p className="text-sm font-medium">
                {items[lightbox].title} — {items[lightbox].category}
              </p>
              <button
                onClick={() => setLightbox(null)}
                aria-label="Fermer"
                className="grid size-11 place-items-center rounded-full glass-soft"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
