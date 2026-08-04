import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { process, services } from "@/lib/site-data";
import { ClipboardList, PenTool, Factory, ShieldCheck, type LucideIcon } from "lucide-react";

const stepIcons: LucideIcon[] = [ClipboardList, PenTool, Factory, ShieldCheck];

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — Enseignes, signalétique & impression | Afric Pub" },
      {
        name: "description",
        content:
          "Enseignes lumineuses LED, signalétique, impression numérique, habillage de véhicules, branding et impression grand format en Algérie.",
      },
      { property: "og:title", content: "Nos services — Afric Pub" },
      { property: "og:description", content: "De la conception 3D à la pose : la chaîne complète de la communication visuelle." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
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

      <section className="mx-auto mt-24 max-w-7xl">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Méthodologie</h2>
        </Reveal>
        <ol className="relative mt-10 grid gap-4 lg:grid-cols-4">
          {/* connecteur en dégradé orange → rouge reliant les 4 étapes */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-orange-400/0 via-primary to-primary/0 lg:block"
          />
          {process.map((p, i) => {
            const Icon = stepIcons[i] ?? ClipboardList;
            return (
              <Reveal as="li" key={p.step} delay={i * 80}>
                <div className="relative h-full rounded-3xl glass p-7">
                  <div className="flex items-center gap-4">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-[0_0_30px_-6px_var(--color-primary)]">
                      <span className="absolute inset-0 rounded-full bg-brand blur-lg opacity-60" />
                      <Icon className="relative h-6 w-6" strokeWidth={2} />
                    </span>
                    <span className="text-sm font-semibold text-primary">{p.step}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
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
