import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { ProcessSteps } from "@/components/ProcessSteps";
import { services } from "@/lib/site-data";

const SITE_URL = "https://premium-afric-vision.lovable.app";
const SERVICES_URL = `${SITE_URL}/services`;
const SERVICES_TITLE = "Services — Enseignes, signalétique & impression | Afric Pub";
const SERVICES_DESC =
  "Enseignes lumineuses LED, habillage Alucobond 3D, découpe CNC, roll-up, impression petit et grand format, packaging et stands d'exposition en Algérie.";
const SERVICES_IMAGE = `${SITE_URL}${services[0].image}`;

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: SERVICES_TITLE },
      { name: "description", content: SERVICES_DESC },
      { property: "og:type", content: "website" },
      { property: "og:title", content: SERVICES_TITLE },
      { property: "og:description", content: SERVICES_DESC },
      { property: "og:url", content: SERVICES_URL },
      { property: "og:image", content: SERVICES_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SERVICES_TITLE },
      { name: "twitter:description", content: SERVICES_DESC },
      { name: "twitter:image", content: SERVICES_IMAGE },
    ],
    links: [{ rel: "canonical", href: SERVICES_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Services Afric Pub",
          description: SERVICES_DESC,
          url: SERVICES_URL,
          numberOfItems: services.length,
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.title,
              description: s.desc,
              image: `${SITE_URL}${s.image}`,
              url: SERVICES_URL,
              serviceType: s.title,
              areaServed: { "@type": "Country", name: "Algérie" },
              provider: { "@type": "Organization", name: "Afric Pub", url: SITE_URL },
            },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Services", item: SERVICES_URL },
          ],
        }),
      },
    ],
  }),
});


function ServicesPage() {
  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Services"
        title="Une chaîne complète, du concept à la pose"
        sub="Atelier intégré, bureau d'études et équipes de pose certifiées : un seul interlocuteur pour tout votre dispositif de communication visuelle."
      />

      <section className="mx-auto mt-16 max-w-7xl">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={i * 70}>
              <article className="group h-full overflow-hidden rounded-3xl glass card-3d p-3">
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-52 w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="p-5">
                  <h2 className="text-xl font-semibold">{s.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-labelledby="methodologie-title" className="mx-auto mt-24 max-w-7xl">
        <Reveal>
          <h2 id="methodologie-title" className="text-3xl font-bold sm:text-4xl">Méthodologie</h2>
        </Reveal>
        <div className="mt-10">
          <ProcessSteps label="Les étapes de notre méthodologie" />
        </div>
      </section>


      <section className="mx-auto mt-20 max-w-7xl">
        <Reveal>
          <div className="rounded-3xl glass glow p-10 text-center sm:p-14">
            <h2 className="text-2xl font-bold sm:text-4xl">Parlons de votre projet</h2>
            <Link
              to="/contact"
              className="mt-6 inline-flex rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              Demander un devis
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
