import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { services } from "@/lib/site-data";
import { submitContactMessage, subscribeNewsletter } from "@/lib/leads.functions";

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
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Contact — Afric Pub" },
      { property: "og:description", content: "Étude technique et devis gratuits sous 24 à 48h." },
      { property: "og:url", content: "https://premium-afric-vision.lovable.app/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact — Afric Pub" },
      { name: "twitter:description", content: "Étude technique et devis gratuits sous 24 à 48h." },
    ],
    links: [{ rel: "canonical", href: "https://premium-afric-vision.lovable.app/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ContactPage",
              "@id": "https://premium-afric-vision.lovable.app/contact#webpage",
              url: "https://premium-afric-vision.lovable.app/contact",
              name: "Contact & devis gratuit — Afric Pub",
              description:
                "Demandez votre devis gratuit pour une enseigne lumineuse, de la signalétique ou une impression grand format. Réponse sous 24h.",
              inLanguage: "fr",
              isPartOf: { "@id": "https://premium-afric-vision.lovable.app/#website" },
              about: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
              publisher: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://premium-afric-vision.lovable.app/contact#breadcrumb",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: "https://premium-afric-vision.lovable.app/" },
                { "@type": "ListItem", position: 2, name: "Contact", item: "https://premium-afric-vision.lovable.app/contact" },
              ],
            },
          ],
        }),
      },
    ],
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
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "throttled">("idle");
  const [news, setNews] = useState<"idle" | "sending" | "sent" | "error" | "throttled">("idle");
  // Horodatage d'ouverture : un envoi en moins de 2,5 s est considéré comme automatisé.
  const [mountedAt] = useState(() => Date.now());

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
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
    setState("sending");
    try {
      const res = await submitContactMessage({
        data: { ...result.data, elapsedMs: Date.now() - mountedAt },
      });
      if (!res.ok) {
        setState("throttled");
        return;
      }
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  };

  const onNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("news") ?? "").trim();
    const company = String(fd.get("company_news") ?? "");
    if (!email) return;
    setNews("sending");
    try {
      const res = await subscribeNewsletter({ data: { email, company } });
      if (!res.ok) {
        setNews("throttled");
        return;
      }
      setNews("sent");
      form.reset();
    } catch {
      setNews("error");
    }
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
            {state === "sent" && (
              <p role="status" className="mb-6 rounded-2xl bg-brand px-4 py-3 text-sm text-primary-foreground">
                Merci ! Votre demande a bien été enregistrée, nous revenons vers vous sous 24h.
              </p>
            )}
            {state === "throttled" && (
              <p role="alert" className="mb-6 rounded-2xl glass-soft px-4 py-3 text-sm text-destructive">
                Vous avez déjà envoyé plusieurs demandes récemment. Merci de patienter une heure, ou
                écrivez-nous sur{" "}
                <a href="https://wa.me/213540481810" target="_blank" rel="noreferrer noopener" className="underline">
                  WhatsApp
                </a>
                .
              </p>
            )}
            {state === "error" && (
              <p role="alert" className="mb-6 rounded-2xl glass-soft px-4 py-3 text-sm text-destructive">
                L'envoi a échoué. Réessayez, ou contactez-nous directement sur{" "}
                <a href="https://wa.me/213540481810" target="_blank" rel="noreferrer noopener" className="underline">
                  WhatsApp
                </a>
                .
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
              disabled={state === "sending"}
              className="mt-7 w-full rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] sm:w-auto"
            >
              {state === "sending" ? "Envoi en cours…" : "Envoyer la demande"}
            </button>
          </form>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid h-full content-start gap-4">
            <div className="rounded-3xl glass p-7">
              <h2 className="text-lg font-semibold">Coordonnées</h2>
              <ul className="mt-4 grid gap-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span>
                    Bouismail, Tipaza, Algérie
                    <span className="block text-xs text-muted-foreground/80">(Pose et intervention sur 58 Wilayas)</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span>Dimanche - Jeudi : 08h30 - 17h00</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="grid gap-1">
                    <a href="tel:+213540481810" className="hover:text-foreground">+213 540 48 18 10</a>
                    <a href="tel:+213559119888" className="hover:text-foreground">+213 559 11 98 88</a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <a href="mailto:contact@africpub.com" className="hover:text-foreground">contact@africpub.com</a>
                </li>
              </ul>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Bouismail%2C+Tipaza%2C+Alg%C3%A9rie"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Voir sur Google Maps
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            <div className="rounded-3xl glass p-7">
              <h2 className="text-lg font-semibold">Newsletter</h2>
              <p className="mt-2 text-sm text-muted-foreground">Nos réalisations et conseils, une fois par mois.</p>
              <form onSubmit={onNewsletter} className="mt-4 grid gap-2">
                <label htmlFor="news" className="sr-only">Votre email</label>
                <input id="news" name="news" type="email" required maxLength={255} className={field} placeholder="vous@entreprise.dz" />
                {/* Honeypot anti-spam */}
                <input type="text" name="company_news" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <button disabled={news === "sending"} className="rounded-full glass-soft px-5 py-3 text-sm font-semibold disabled:opacity-60">
                  {news === "sending" ? "Inscription…" : "S'inscrire"}
                </button>
                {news === "sent" && (
                  <p role="status" className="text-xs text-muted-foreground">Merci, votre inscription est enregistrée.</p>
                )}
                {news === "throttled" && (
                  <p role="alert" className="text-xs text-destructive">Trop de tentatives, réessayez dans une heure.</p>
                )}
                {news === "error" && (
                  <p role="alert" className="text-xs text-destructive">Inscription impossible pour le moment.</p>
                )}
              </form>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
