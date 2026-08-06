import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { process, stats } from "@/lib/site-data";
import stand from "@/assets/stand.jpg.asset.json";

export const Route = createFileRoute("/a-propos")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "À propos — Afric Pub, agence de communication globale" },
      {
        name: "description",
        content:
          "Mission, vision, valeurs et atelier d'Afric Pub : 18 ans d'expérience en enseignes lumineuses et communication visuelle en Algérie.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "À propos — Afric Pub" },
      {
        property: "og:description",
        content: "Notre histoire, notre atelier et nos engagements qualité.",
      },
      { property: "og:url", content: "https://africpub.tech/a-propos" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "À propos — Afric Pub" },
      {
        name: "twitter:description",
        content: "Notre histoire, notre atelier et nos engagements qualité.",
      },
    ],
    links: [{ rel: "canonical", href: "https://africpub.tech/a-propos" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "AboutPage",
              "@id": "https://africpub.tech/a-propos#webpage",
              url: "https://africpub.tech/a-propos",
              name: "À propos — Afric Pub, agence de communication globale",
              description:
                "Mission, vision, valeurs et atelier d'Afric Pub : 18 ans d'expérience en enseignes lumineuses et communication visuelle en Algérie.",
              inLanguage: "fr",
              isPartOf: { "@id": "https://africpub.tech/#website" },
              about: { "@id": "https://africpub.tech/#organization" },
              publisher: { "@id": "https://africpub.tech/#organization" },
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://africpub.tech/a-propos#breadcrumb",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Accueil",
                  item: "https://africpub.tech/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "À propos",
                  item: "https://africpub.tech/a-propos",
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
});

const values = [
  {
    title: "Exigence",
    desc: "Contrôle qualité à chaque étape, du fichier de découpe à la pose finale.",
  },
  {
    title: "Sécurité",
    desc: "Structures calculées, câblage aux normes, équipes habilitées travail en hauteur.",
  },
  {
    title: "Durabilité",
    desc: "Matériaux certifiés, LED basse consommation, recyclage des chutes.",
  },
  { title: "Proximité", desc: "Un chef de projet unique, joignable, du brief au SAV." },
];

const timeline = [
  { year: "2008", text: "Création de l'atelier à Alger, spécialisé en lettrage et vitrophanie." },
  { year: "2013", text: "Intégration de la fabrication d'enseignes LED et du bureau d'études." },
  { year: "2018", text: "Ouverture du pôle grand format et covering de flottes." },
  { year: "2026", text: "Couverture nationale sur les 58 wilayas et pôle branding digital." },
];

function AboutPage() {
  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="À propos"
        title="Une agence, un atelier, une exigence"
        sub="Afric Pub conçoit, fabrique et installe les dispositifs de communication visuelle des marques les plus exigeantes d'Algérie."
      />

      <section className="mx-auto mt-16 grid max-w-7xl gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-3xl glass p-8">
            <h2 className="text-2xl font-semibold">Mission</h2>
            <p className="mt-3 text-muted-foreground">
              Rendre chaque marque immédiatement identifiable dans l'espace physique, avec des
              dispositifs fiables, durables et parfaitement exécutés.
            </p>
            <h2 className="mt-8 text-2xl font-semibold">Vision</h2>
            <p className="mt-3 text-muted-foreground">
              Devenir la référence maghrébine de la communication visuelle intégrée, alliant
              industrie et design.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="overflow-hidden rounded-3xl glass p-2">
            <img
              src={stand.url}
              alt="Atelier et stand Afric Pub"
              loading="lazy"
              width={1280}
              height={719}
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Nos valeurs</h2>
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 70}>
              <div className="h-full rounded-3xl glass card-3d p-7">
                <h3 className="text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-20 max-w-4xl">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Notre histoire</h2>
        </Reveal>
        <ol className="mt-8 grid gap-4">
          {timeline.map((item, i) => (
            <Reveal as="li" key={item.year} delay={i * 70}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 rounded-3xl glass p-6">
                <span className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-primary-foreground">
                  {item.year}
                </span>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <Reveal>
          <ul className="grid grid-cols-2 gap-3 rounded-3xl glass p-8 lg:grid-cols-4">
            {stats.map((s) => (
              <li key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-gradient">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="mx-auto mt-20 max-w-7xl">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Comment nous travaillons</h2>
        </Reveal>
        <ol className="mt-8 grid gap-4 lg:grid-cols-4">
          {process.map((p, i) => (
            <Reveal as="li" key={p.step} delay={i * 70}>
              <div className="h-full rounded-3xl glass p-7">
                <span className="text-sm font-semibold text-primary">{p.step}</span>
                <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>
    </div>
  );
}
