import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { services, projects, faq } from "@/lib/site-data";

const SITE_URL = "https://premium-afric-vision.lovable.app";
const SEARCH_URL = `${SITE_URL}/recherche`;
const TITLE = "Recherche — Trouvez un service ou une réalisation | Afric Pub";
const DESC =
  "Recherchez parmi les services, réalisations et questions fréquentes d'Afric Pub : enseignes lumineuses, signalétique, impression et branding.";

type Result = { title: string; excerpt: string; to: string; hash?: string; kind: string };

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function search(query: string): Result[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const results: Result[] = [];

  for (const s of services) {
    if (normalize(`${s.title} ${s.desc}`).includes(q)) {
      results.push({ title: s.title, excerpt: s.desc, to: "/services", hash: s.slug, kind: "Service" });
    }
  }
  for (const p of projects) {
    if (normalize(`${p.title} ${p.category} ${p.city}`).includes(q)) {
      results.push({
        title: p.title,
        excerpt: `${p.category} — ${p.city}`,
        to: "/portfolio",
        kind: "Réalisation",
      });
    }
  }
  for (const f of faq) {
    if (normalize(`${f.q} ${f.a}`).includes(q)) {
      results.push({ title: f.q, excerpt: f.a, to: "/faq", kind: "FAQ" });
    }
  }

  return results;
}

export const Route = createFileRoute("/recherche")({
  validateSearch: (input: Record<string, unknown>) => ({
    q: typeof input.q === "string" ? input.q : "",
  }),
  component: SearchPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: SEARCH_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: SEARCH_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          "@id": `${SEARCH_URL}#webpage`,
          url: SEARCH_URL,
          name: TITLE,
          description: DESC,
          inLanguage: "fr",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        }),
      },
    ],
  }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/recherche" });
  const [value, setValue] = useState(q);
  const results = search(q);

  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Recherche"
        title="Trouvez ce que vous cherchez"
        sub="Services, réalisations et réponses aux questions fréquentes, en un seul endroit."
      />

      <section className="mx-auto mt-12 max-w-3xl">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ search: { q: value } });
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="q" className="sr-only">
            Rechercher sur le site
          </label>
          <input
            id="q"
            name="q"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enseigne lumineuse, Alucobond, délais…"
            className="w-full rounded-full glass-soft px-5 py-3 text-sm outline-none ring-brand/40 focus-visible:ring-2"
          />
          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Rechercher
          </button>
        </form>

        <div className="mt-10" aria-live="polite">
          {q && (
            <p className="text-sm text-muted-foreground">
              {results.length} résultat{results.length > 1 ? "s" : ""} pour « {q} »
            </p>
          )}

          <ul className="mt-6 space-y-3">
            {results.map((r, i) => (
              <Reveal as="li" key={`${r.kind}-${r.title}-${i}`} delay={i * 50}>
                <Link
                  to={r.to}
                  hash={r.hash}
                  className="block rounded-3xl glass p-6 transition-transform hover:-translate-y-0.5"
                >
                  <span className="text-xs uppercase tracking-widest text-brand">{r.kind}</span>
                  <h2 className="mt-2 text-lg font-semibold">{r.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{r.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </ul>

          {q && results.length === 0 && (
            <p className="mt-6 rounded-3xl glass p-8 text-center text-sm text-muted-foreground">
              Aucun résultat. Essayez un autre mot-clé ou{" "}
              <Link to="/contact" className="text-brand underline">
                contactez-nous
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
