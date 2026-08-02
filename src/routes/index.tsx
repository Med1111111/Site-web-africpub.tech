import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/Reveal";
import { useApp } from "@/lib/app-context";
import { listPublicTestimonials } from "@/lib/content.functions";
import { clients, process, projects, services, stats, testimonials } from "@/lib/site-data";
import stand from "@/assets/stand.jpg.asset.json";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Afric Pub — Enseignes lumineuses & signalétique en Algérie" },
      {
        name: "description",
        content:
          "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding partout en Algérie.",
      },
      { property: "og:title", content: "Afric Pub — Enseignes lumineuses & signalétique en Algérie" },
      {
        property: "og:description",
        content: "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding partout en Algérie.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const gallery = [p1, p2, p3];

function Home() {
  const { t } = useApp();

  return (
    <div className="px-3 sm:px-6">
      {/* ---------- HERO ---------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 pt-32 sm:pt-40 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full glass-soft px-4 py-1.5 text-xs tracking-wide text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            {t("hero.badge")}
          </p>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] sm:text-7xl">
            {t("hero.title1")} <span className="text-gradient">{t("hero.title2")}</span>
            <br />
            {t("hero.title3")}
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.04]"
            >
              {t("hero.cta1")}
            </Link>
            <Link
              to="/portfolio"
              className="rounded-full glass px-7 py-3.5 text-sm font-semibold transition-transform hover:scale-[1.04]"
            >
              {t("hero.cta2")}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-3xl glass p-2">
            <img
              src={stand.url}
              alt="Stand Afric Pub illuminé en rouge lors d'un salon professionnel"
              className="h-full w-full rounded-2xl object-cover"
              width={1280}
              height={719}
            />
          </div>
        </Reveal>
      </section>

      {/* ---------- STATISTIQUES ---------- */}
      <section aria-label="Chiffres clés" className="mx-auto mt-20 max-w-7xl">
        <Reveal>
          <ul className="grid grid-cols-2 gap-3 rounded-3xl glass p-6 sm:p-8 lg:grid-cols-4">
            {stats.map((s) => (
              <li key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-gradient sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section aria-labelledby="services-title" className="mx-auto mt-28 max-w-7xl">
        <Reveal>
          <h2 id="services-title" className="text-3xl font-bold sm:text-5xl">
            {t("section.services")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t("section.services.sub")}</p>
        </Reveal>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={i * 70}>
              <article className="group h-full rounded-3xl glass card-3d p-7">
                <span
                  aria-hidden="true"
                  className="grid size-12 place-items-center rounded-2xl bg-brand text-xl text-primary-foreground transition-transform duration-500 group-hover:rotate-12"
                >
                  {s.icon}
                </span>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- PORTFOLIO ---------- */}
      <section aria-labelledby="portfolio-title" className="mx-auto mt-28 max-w-7xl">
        <Reveal>
          <h2 id="portfolio-title" className="text-3xl font-bold sm:text-5xl">
            {t("section.portfolio")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">{t("section.portfolio.sub")}</p>
        </Reveal>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {gallery.map((src, i) => (
            <Reveal as="li" key={src} delay={i * 90}>
              <figure className="group relative overflow-hidden rounded-3xl glass p-2">
                <img
                  src={src}
                  alt={projects[i].title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-64 w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="flex items-center justify-between px-3 py-4">
                  <span className="text-sm font-medium">{projects[i].title}</span>
                  <span className="rounded-full glass-soft px-3 py-1 text-xs text-muted-foreground">
                    {projects[i].city}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <div className="mt-8">
            <Link to="/portfolio" className="inline-flex rounded-full glass px-6 py-3 text-sm font-semibold">
              Voir tout le portfolio
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- PROCESSUS ---------- */}
      <section aria-labelledby="process-title" className="mx-auto mt-28 max-w-7xl">
        <Reveal>
          <h2 id="process-title" className="text-3xl font-bold sm:text-5xl">
            {t("section.process")}
          </h2>
        </Reveal>
        <ol className="mt-10 grid gap-4 lg:grid-cols-4">
          {process.map((p, i) => (
            <Reveal as="li" key={p.step} delay={i * 80}>
              <div className="h-full rounded-3xl glass p-7">
                <span className="text-sm font-semibold text-primary">{p.step}</span>
                <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- CLIENTS ---------- */}
      <section aria-labelledby="clients-title" className="mx-auto mt-28 max-w-7xl">
        <Reveal>
          <h2 id="clients-title" className="text-center text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {t("section.clients")}
          </h2>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {clients.map((c) => (
              <li key={c} className="rounded-full glass-soft px-6 py-3 text-sm text-muted-foreground">
                {c}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------- TEMOIGNAGES ---------- */}
      <section aria-labelledby="testimonials-title" className="mx-auto mt-28 max-w-7xl">
        <Reveal>
          <h2 id="testimonials-title" className="text-3xl font-bold sm:text-5xl">
            {t("section.testimonials")}
          </h2>
        </Reveal>
        <TestimonialsGrid />

      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto mt-28 max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass glow p-10 text-center sm:p-16">
            <h2 className="text-3xl font-bold sm:text-5xl">{t("cta.title")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("cta.sub")}</p>
            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-brand px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
            >
              {t("cta.quote")}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// Témoignages pilotés par l'espace admin, avec repli sur le contenu statique.
function TestimonialsGrid() {
  const { data } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: () => listPublicTestimonials(),
  });

  const items =
    data && data.length > 0
      ? data.map((tm) => ({ quote: tm.quote, name: tm.name, role: tm.role }))
      : testimonials;

  return (
    <ul className="mt-10 grid gap-4 lg:grid-cols-3">
      {items.map((tm, i) => (
        <Reveal as="li" key={`${tm.name}-${i}`} delay={i * 80}>
          <blockquote className="h-full rounded-3xl glass p-7">
            <p className="text-base">“{tm.quote}”</p>
            <footer className="mt-5 text-sm text-muted-foreground">
              <strong className="text-foreground">{tm.name}</strong> — {tm.role}
            </footer>
          </blockquote>
        </Reveal>
      ))}
    </ul>
  );
}
