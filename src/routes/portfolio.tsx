import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { listPublicPortfolio } from "@/lib/content.functions";
import { categories, projects } from "@/lib/site-data";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";

export const Route = createFileRoute("/portfolio")({
  component: PortfolioPage,
  head: () => ({
    meta: [
      { title: "Portfolio — Réalisations Afric Pub" },
      {
        name: "description",
        content:
          "Découvrez nos réalisations : enseignes lumineuses, signalétique, covering de flotte et habillage de façade dans toute l'Algérie.",
      },
      { property: "og:title", content: "Portfolio — Afric Pub" },
      { property: "og:description", content: "Enseignes, signalétique, véhicules et grand format : nos projets livrés." },
      { property: "og:url", content: "/portfolio" },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
});

const images = [p1, p3, p2, p1, p2, p3];

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
          city: p.city,
          img: p.image_url || images[i % images.length],
        }))
      : projects.map((p, i) => ({ ...p, img: images[i % images.length] }));

  const visible = items
    .map((p, i) => ({ ...p, index: i }))
    .filter((p) => filter === "Tous" || p.category === filter);

  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Portfolio"
        title="Nos réalisations"
        sub="Une sélection de projets livrés pour des enseignes nationales et des groupes internationaux implantés en Algérie."
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
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={768}
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
            <img
              src={items[lightbox].img}
              alt={items[lightbox].title}
              width={1024}
              height={768}
              className="w-full rounded-2xl object-cover"
            />
            <div className="flex items-center justify-between px-3 py-4">
              <p className="text-sm font-medium">
                {items[lightbox].title} — {items[lightbox].city}
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
