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
          "@graph": services.map((s) => ({
            "@type": "Service",
            "@id": `${SERVICES_URL}#${s.slug}`,
            name: s.title,
            description: s.desc,
            image: `${SITE_URL}${s.image}`,
            url: `${SERVICES_URL}#${s.slug}`,
            serviceType: s.title,
            category: "Communication visuelle",
            areaServed: { "@type": "Country", name: "Algérie" },
            provider: { "@id": `${SITE_URL}/#organization` },
            isPartOf: { "@id": `${SITE_URL}/#website` },
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/contact`,
              availability: "https://schema.org/InStock",
              priceCurrency: "DZD",
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "DZD",
                valueAddedTaxIncluded: false,
              },
              areaServed: { "@type": "Country", name: "Algérie" },
              seller: { "@id": `${SITE_URL}/#organization` },
            },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${SERVICES_URL}#services`,
          name: "Services Afric Pub",
          description: SERVICES_DESC,
          url: SERVICES_URL,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          numberOfItems: services.length,
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.title,
            url: `${SERVICES_URL}#${s.slug}`,
            item: { "@id": `${SERVICES_URL}#${s.slug}` },
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

      <section aria-labelledby="services-list-title" className="mx-auto mt-20 max-w-4xl">
        <h2 id="services-list-title" className="sr-only">
          Nos services
        </h2>
        <ul className="divide-y divide-border/20">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={i * 60}>
              <article id={s.slug} className="group scroll-mt-24 py-10 sm:py-12">
                <div className="flex items-start gap-4 sm:gap-5">
                  <span className="select-none pt-0.5 text-base text-primary/80 sm:text-lg" aria-hidden="true">
                    {s.icon}
                  </span>
                  <div>
                    <h3 className="whitespace-pre-line text-lg font-semibold tracking-tight sm:text-xl">{s.title}</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-labelledby="methodologie-title" className="mx-auto mt-24 max-w-4xl">
        <Reveal>
          <h2 id="methodologie-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Méthodologie
          </h2>
        </Reveal>
        <div className="mt-10">
          <ProcessSteps label="Les étapes de notre méthodologie" />
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-4xl pb-20 text-center">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight sm:text-4xl">Parlons de votre projet</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Nous vous accompagnons de l'idée jusqu'à la pose. Demandez un devis personnalisé.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
          >
            Demander un devis
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
