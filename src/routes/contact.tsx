import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { services } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact & devis gratuit — Afric Pub" },
      {
        name: "description",
        content:
          "Demandez votre devis gratuit pour une enseigne lumineuse, de la signalétique ou une impression grand format. Réponse sous 24h.",
      },
      { property: "og:title", content: "Contact — Afric Pub" },
      { property: "og:description", content: "Étude technique et devis gratuits sous 24 à 48h." },
      { property: "og:url", content: "https://premium-afric-vision.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://premium-afric-vision.lovable.app/contact" }],
  }),
});

// Validation stricte côté client (longueurs bornées, trim, anti-spam honeypot).
const schema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  service: z.string().trim().max(80),
  message: z.string().trim().min(10, "Décrivez votre projet (10 caractères min.)").max(1500),
  company: z.string().max(0), // honeypot : doit rester vide
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const result = schema.safeParse({ ...data, company: data.company ?? "" });
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setSent(true);
  };

  const field =
    "mt-2 w-full rounded-2xl glass-soft px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none";

  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Contact"
        title="Parlons de votre projet"
        sub="Étude technique et devis détaillé gratuits. Réponse sous 24 à 48h ouvrées."
      />

      <section className="mx-auto mt-14 grid max-w-7xl gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <form onSubmit={onSubmit} noValidate className="rounded-3xl glass p-8">
            {sent && (
              <p role="status" className="mb-6 rounded-2xl bg-brand px-4 py-3 text-sm text-primary-foreground">
                Merci ! Votre demande a bien été enregistrée, nous revenons vers vous sous 24h.
              </p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium">Nom complet</label>
                <input id="name" name="name" required maxLength={100} className={field} placeholder="Votre nom" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input id="email" name="email" type="email" required maxLength={255} className={field} placeholder="vous@entreprise.dz" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium">Téléphone (optionnel)</label>
                <input id="phone" name="phone" type="tel" maxLength={30} className={field} placeholder="+213 …" />
              </div>
              <div>
                <label htmlFor="service" className="text-sm font-medium">Service souhaité</label>
                <select id="service" name="service" className={field}>
                  {services.map((s) => (
                    <option key={s.slug} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="message" className="text-sm font-medium">Votre projet</label>
              <textarea id="message" name="message" rows={5} required maxLength={1500} className={field} placeholder="Dimensions, lieu, délais…" />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>

            {/* Honeypot anti-spam, masqué aux utilisateurs et aux lecteurs d'écran */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] sm:w-auto"
            >
              Envoyer la demande
            </button>
          </form>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid h-full content-start gap-4">
            <div className="rounded-3xl glass p-7">
              <h2 className="text-lg font-semibold">Coordonnées</h2>
              <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <li>Alger, Algérie</li>
                <li><a href="mailto:contact@africpub.dz" className="hover:text-foreground">contact@africpub.dz</a></li>
                <li><a href="tel:+213000000000" className="hover:text-foreground">+213 00 00 00 00</a></li>
              </ul>
            </div>
            <div className="rounded-3xl glass p-7">
              <h2 className="text-lg font-semibold">Newsletter</h2>
              <p className="mt-2 text-sm text-muted-foreground">Nos réalisations et conseils, une fois par mois.</p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-4 grid gap-2"
              >
                <label htmlFor="news" className="sr-only">Votre email</label>
                <input id="news" type="email" required maxLength={255} className={field} placeholder="vous@entreprise.dz" />
                <button className="rounded-full glass-soft px-5 py-3 text-sm font-semibold">S'inscrire</button>
              </form>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
