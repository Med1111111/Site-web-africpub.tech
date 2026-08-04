import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { faq } from "@/lib/site-data";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — Délais, garanties et pose | Afric Pub" },
      {
        name: "description",
        content:
          "Réponses aux questions fréquentes : délais de fabrication, couverture nationale, devis gratuit, garanties LED et autorisations de pose.",
      },
      { property: "og:title", content: "FAQ — Afric Pub" },
      { property: "og:description", content: "Délais, garanties, devis et autorisations : tout ce qu'il faut savoir." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://premium-afric-vision.lovable.app/faq" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FAQ — Afric Pub" },
      { name: "twitter:description", content: "Délais, garanties, devis et autorisations : tout ce qu'il faut savoir." },
    ],
    links: [{ rel: "canonical", href: "https://premium-afric-vision.lovable.app/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "FAQPage",
              "@id": "https://premium-afric-vision.lovable.app/faq#faqpage",
              url: "https://premium-afric-vision.lovable.app/faq",
              name: "FAQ — Afric Pub",
              description:
                "Réponses aux questions fréquentes : délais de fabrication, couverture nationale, devis gratuit, garanties LED et autorisations de pose.",
              inLanguage: "fr",
              isPartOf: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
              publisher: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
              mainEntity: faq.map((f, i) => ({
                "@type": "Question",
                "@id": `https://premium-afric-vision.lovable.app/faq#question-${i + 1}`,
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://premium-afric-vision.lovable.app/faq#breadcrumb",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Accueil",
                  item: "https://premium-afric-vision.lovable.app/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "FAQ",
                  item: "https://premium-afric-vision.lovable.app/faq",
                },
              ],
            },
          ],
        }),
      },
    ],
  }),

});

function FaqPage() {
  return (
    <div className="px-3 sm:px-6">
      <PageHeader eyebrow="FAQ" title="Questions fréquentes" sub="Les réponses aux demandes les plus courantes de nos clients." />

      <section className="mx-auto mt-14 max-w-3xl">
        <ul className="grid gap-3">
          {faq.map((f, i) => (
            <Reveal as="li" key={f.q} delay={i * 60}>
              <details className="group rounded-3xl glass p-6">
                <summary className="cursor-pointer list-none text-base font-semibold marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span aria-hidden="true" className="text-primary transition-transform group-open:rotate-45">＋</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
