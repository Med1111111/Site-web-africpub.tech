import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/conditions")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Conditions générales — Afric Pub" },
      {
        name: "description",
        content: "Conditions générales de vente et d'utilisation : devis, délais, paiement, garanties et propriété intellectuelle.",
      },
      { property: "og:title", content: "Conditions générales — Afric Pub" },
      { property: "og:description", content: "Devis, délais, paiement, garanties et propriété intellectuelle." },
      { property: "og:url", content: "https://premium-afric-vision.lovable.app/conditions" },
    ],
    links: [{ rel: "canonical", href: "https://premium-afric-vision.lovable.app/conditions" }],
  }),
});

const sections = [
  { title: "Devis et commande", body: "Tout devis est valable 30 jours. La commande est ferme à réception du bon signé et de l'acompte convenu." },
  { title: "Délais", body: "Les délais annoncés courent à compter de la validation du bon à tirer et sont suspendus en cas d'attente d'autorisation administrative." },
  { title: "Paiement", body: "Sauf accord contraire, 50% à la commande et le solde à la livraison ou à la pose." },
  { title: "Garanties", body: "3 ans sur les modules LED et alimentations, 2 ans sur la structure, hors dégradations, actes de vandalisme et intempéries exceptionnelles." },
  { title: "Propriété intellectuelle", body: "Les créations graphiques restent notre propriété jusqu'au paiement intégral. Le client garantit détenir les droits sur les éléments qu'il fournit." },
  { title: "Responsabilité", body: "Notre responsabilité est limitée au montant de la prestation. Le client demeure responsable des autorisations d'affichage sur son domaine." },
];

function TermsPage() {
  return (
    <div className="px-3 sm:px-6">
      <PageHeader eyebrow="Légal" title="Conditions générales" sub="Dernière mise à jour : juillet 2026." />
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
