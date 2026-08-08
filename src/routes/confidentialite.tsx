import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/confidentialite")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Afric Pub" },
      {
        name: "description",
        content: "Comment Afric Pub collecte, utilise et protège vos données personnelles lors d'une demande de devis.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Politique de confidentialité — Afric Pub" },
      { property: "og:description", content: "Collecte, usage et protection de vos données personnelles." },
      { property: "og:url", content: "https://premium-afric-vision.lovable.app/confidentialite" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Politique de confidentialité — Afric Pub" },
      { name: "twitter:description", content: "Collecte, usage et protection de vos données personnelles." },
    ],
    links: [{ rel: "canonical", href: "https://premium-afric-vision.lovable.app/confidentialite" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://premium-afric-vision.lovable.app/confidentialite#webpage",
              url: "https://premium-afric-vision.lovable.app/confidentialite",
              name: "Politique de confidentialité — Afric Pub",
              description: "Comment Afric Pub collecte, utilise et protège vos données personnelles.",
              inLanguage: "fr",
              isPartOf: { "@id": "https://premium-afric-vision.lovable.app/#website" },
              publisher: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://premium-afric-vision.lovable.app/confidentialite#breadcrumb",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: "https://premium-afric-vision.lovable.app/" },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Politique de confidentialité",
                  item: "https://premium-afric-vision.lovable.app/confidentialite",
                },
              ],
            },
          ],
        }),
      },
    ],
  }),

});

const sections = [
  {
    title: "Données collectées",
    body: "Nous collectons uniquement les informations que vous transmettez volontairement via nos formulaires : nom, email, téléphone, service souhaité et description du projet.",
  },
  {
    title: "Finalité",
    body: "Ces données servent exclusivement à traiter votre demande de devis, vous répondre et assurer le suivi commercial du projet.",
  },
  {
    title: "Conservation",
    body: "Les demandes sont conservées trois ans à compter du dernier contact, puis supprimées.",
  },
  {
    title: "Partage",
    body: "Aucune donnée n'est vendue ni cédée. Elles peuvent être traitées par nos prestataires techniques d'hébergement, sous contrat de confidentialité.",
  },
  {
    title: "Vos droits",
    body: "Vous disposez d'un droit d'accès, de rectification et de suppression. Écrivez à contact@africpub.tech pour l'exercer.",
  },
  {
    title: "Cookies",
    body: "Le site n'utilise pas de cookies publicitaires. Seules vos préférences de langue et de thème sont stockées localement dans votre navigateur.",
  },
];

function PrivacyPage() {
  return (
    <div className="px-3 sm:px-6">
      <PageHeader eyebrow="Légal" title="Politique de confidentialité" sub="Dernière mise à jour : juillet 2026." />
      <section className="mx-auto mt-12 grid max-w-3xl gap-3">
        {sections.map((s, i) => (
          <Reveal key={s.title} delay={i * 50}>
            <article className="rounded-3xl glass p-7">
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </article>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
