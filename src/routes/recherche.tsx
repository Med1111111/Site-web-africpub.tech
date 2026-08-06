import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Search, X, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { services, projects, faq } from "@/lib/site-data";

const SITE_URL = "https://africpub.tech";
const SEARCH_URL = `${SITE_URL}/recherche`;
const TITLE = "Recherche — Trouvez un service ou une réalisation | Afric Pub";
const DESC =
  "Recherchez parmi les services, réalisations et questions fréquentes d'Afric Pub : enseignes lumineuses, signalétique, impression et branding.";

const PER_PAGE = 6;

const SUGGESTIONS = [
  "Enseigne lumineuse",
  "Alucobond 3D",
  "Découpe CNC",
  "Roll-up",
  "Stand d'exposition",
  "Impression petit format",
  "Packaging",
  "Affichage LED",
  "Délais",
  "Devis gratuit",
];

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
      results.push({
        title: s.title,
        excerpt: s.desc,
        to: "/services",
        hash: s.slug,
        kind: "Service",
      });
    }
  }
  for (const p of projects) {
    if (normalize(`${p.title} ${p.category}`).includes(q)) {
      results.push({
        title: p.title,
        excerpt: p.category,
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
    page: Number(input.page) > 0 ? Math.floor(Number(input.page)) : 1,
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
  const { q, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/recherche" });
  const [value, setValue] = useState(q);
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => search(q), [q]);
  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const pageResults = results.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const suggestions = useMemo(() => {
    const v = normalize(value.trim());
    const pool = v ? SUGGESTIONS.filter((s) => normalize(s).includes(v)) : SUGGESTIONS;
    return pool.slice(0, 6);
  }, [value]);

  const submit = (term: string) => {
    setOpen(false);
    setValue(term);
    navigate({ search: { q: term, page: 1 } });
  };

  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Recherche"
        title="Trouvez ce que vous cherchez"
        sub="Services, réalisations et réponses aux questions fréquentes, en un seul endroit."
      />

      <section className="mx-auto mt-12 max-w-3xl pb-24">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
          className="relative"
        >
          <label htmlFor="q" className="sr-only">
            Rechercher sur le site
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand"
              />
              <input
                id="q"
                name="q"
                type="search"
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-controls="search-suggestions"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  blurTimer.current = setTimeout(() => setOpen(false), 120);
                }}
                placeholder="Enseigne lumineuse, Alucobond, délais…"
                className="w-full rounded-full glass-soft py-3 pl-12 pr-11 text-sm outline-none ring-brand/40 transition focus-visible:ring-2"
              />
              {value && (
                <button
                  type="button"
                  aria-label="Effacer la recherche"
                  onClick={() => {
                    setValue("");
                    navigate({ search: { q: "", page: 1 } });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="neon-social-pill rounded-full bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]"
            >
              Rechercher
            </button>
          </div>

          {open && suggestions.length > 0 && (
            <ul
              id="search-suggestions"
              role="listbox"
              aria-label="Suggestions de recherche"
              className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-3xl glass p-2 shadow-xl sm:right-[9.5rem]"
            >
              {suggestions.map((s) => (
                <li key={s} role="option" aria-selected={normalize(s) === normalize(value)}>
                  <button
                    type="button"
                    onMouseDown={() => {
                      if (blurTimer.current) clearTimeout(blurTimer.current);
                    }}
                    onClick={() => submit(s)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-left text-sm transition hover:bg-brand/10"
                  >
                    <span className="flex items-center gap-3">
                      <Search className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                      {s}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {!q && (
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Recherches fréquentes
            </span>
            {SUGGESTIONS.slice(0, 5).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full glass-soft px-4 py-1.5 text-xs transition hover:-translate-y-0.5 hover:text-brand"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10" aria-live="polite">
          {q && (
            <p className="text-sm text-muted-foreground">
              {results.length} résultat{results.length > 1 ? "s" : ""} pour « {q} »
              {results.length > PER_PAGE && ` — page ${current} sur ${totalPages}`}
            </p>
          )}

          <ul className="mt-6 space-y-3">
            {pageResults.map((r, i) => (
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

          {totalPages > 1 && (
            <nav
              aria-label="Pagination des résultats"
              className="mt-8 flex items-center justify-center gap-2"
            >
              <Link
                to="/recherche"
                search={{ q, page: Math.max(1, current - 1) }}
                aria-label="Page précédente"
                aria-disabled={current === 1}
                className={`rounded-full glass-soft p-2.5 transition ${
                  current === 1 ? "pointer-events-none opacity-40" : "hover:text-brand"
                }`}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  to="/recherche"
                  search={{ q, page: p }}
                  aria-label={`Page ${p}`}
                  aria-current={p === current ? "page" : undefined}
                  className={`min-w-10 rounded-full px-4 py-2 text-center text-sm transition ${
                    p === current
                      ? "bg-brand font-semibold text-primary-foreground"
                      : "glass-soft hover:text-brand"
                  }`}
                >
                  {p}
                </Link>
              ))}

              <Link
                to="/recherche"
                search={{ q, page: Math.min(totalPages, current + 1) }}
                aria-label="Page suivante"
                aria-disabled={current === totalPages}
                className={`rounded-full glass-soft p-2.5 transition ${
                  current === totalPages ? "pointer-events-none opacity-40" : "hover:text-brand"
                }`}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>
          )}

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
