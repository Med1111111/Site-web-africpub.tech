import { createFileRoute, Link } from "@tanstack/react-router";

import { Facebook, Instagram, MapPin, MessageCircle, Youtube } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { ProcessSteps } from "@/components/ProcessSteps";
import { useApp } from "@/lib/app-context";
import { getPublicSiteSettings } from "@/lib/content.functions";
import { clients, projects, services } from "@/lib/site-data";

import standCutout from "@/assets/stand-cutout.png.asset.json";
import enseigne3d from "@/assets/enseigne-3d.png.asset.json";


const siteSettingsQuery = {
  queryKey: ["site-settings"] as const,
  queryFn: () => getPublicSiteSettings(),
};

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => context.queryClient.ensureQueryData(siteSettingsQuery),
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
      { property: "og:url", content: "https://premium-afric-vision.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://premium-afric-vision.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://premium-afric-vision.lovable.app/#webpage",
          url: "https://premium-afric-vision.lovable.app/",
          name: "Afric Pub — Enseignes lumineuses & signalétique en Algérie",
          description:
            "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding partout en Algérie.",
          inLanguage: "fr",
          isPartOf: { "@id": "https://premium-afric-vision.lovable.app/#website" },
          about: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
          publisher: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
        }),
      },
    ],
  }),

});

const gallery = [p1, p2, p3];

const socials = [
  { label: "Facebook", href: "https://web.facebook.com/AFRICPUB", icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/afric_pub/", icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCCyWZb1m1H8CQJhh7FgmHlw", icon: Youtube },
];


function Home() {
  const { t } = useApp();
  // Données issues du loader : identiques au SSR, donc pas de décalage d'hydratation.
  const settings = Route.useLoaderData();




  return (
    <div className="px-3 sm:px-6">
      {/* ---------- HERO ---------- */}
      <section className="mx-auto grid max-w-7xl items-center gap-6 pt-32 sm:pt-40 lg:grid-cols-[1.05fr_1fr]">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full glass-soft px-4 py-1.5 text-xs tracking-wide text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            {settings?.hero_badge || t("hero.badge")}
          </p>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] sm:text-7xl">
            {t("hero.title1")} <span className="text-gradient">{t("hero.title2")}</span>
            <br />
            {t("hero.title3")}
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/contact"
              className="rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.04]"
            >
              {t("hero.cta1")}
            </Link>
            <a
              href="https://wa.me/213540481810"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full neon-social-pill px-7 py-3.5 text-sm font-semibold"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href="https://www.google.com/maps/place/Afric+Pub/@36.6379976,2.6934306,17z/data=!3m1!4b1!4m6!3m5!1s0x128f9d7138d27c07:0xb356a71bb9d8d9b6!8m2!3d36.6379976!4d2.6934306!16s%2Fg%2F11fcqqwyh5?hl=fr&entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full neon-social-pill px-7 py-3.5 text-sm font-semibold"
            >
              <MapPin className="size-4" aria-hidden="true" />
              Maps
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap items-center gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="inline-flex size-11 items-center justify-center rounded-full neon-social"
                >
                  <s.icon className="size-5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

        </Reveal>

        <Reveal delay={120}>
          <div className="relative lg:-ml-16 xl:-ml-24">
            {/* Halo lumineux rouge/orange — renforce le thème "donner de la lumière" */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-16 -z-10 opacity-90 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(255,120,40,0.5), transparent 70%), radial-gradient(ellipse 70% 45% at 50% 70%, rgba(227,6,19,0.42), transparent 72%)",
              }}
            />
            {/* Spot lumineux au sol */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 bottom-2 -z-10 h-16 rounded-[100%] opacity-70 blur-2xl"
              style={{ background: "radial-gradient(ellipse at center, rgba(255,120,50,0.55), transparent 70%)" }}
            />
            <img
              src={standCutout.url}
              alt="Stand d'exposition Afric Pub avec enseignes lumineuses rouges et écrans"
              className="relative w-[118%] max-w-none -translate-x-[6%] scale-[1.06] drop-shadow-[0_30px_60px_rgba(227,6,19,0.35)] lg:w-[128%] lg:-translate-x-[4%]"
              width={1512}
              height={1024}
            />
          </div>
        </Reveal>
      </section>

      {/* ---------- QUI SOMMES-NOUS ---------- */}
      <section aria-labelledby="about-title" className="mx-auto mt-20 max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <h2 id="about-title" className="text-3xl font-bold sm:text-5xl">
              Qui sommes-nous ?
            </h2>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Afric Pub est une agence de communication globale basée à Alger, spécialisée dans les
              enseignes lumineuses, la signalétique et l'impression grand format en Algérie. De
              l'étude technique à la pose, notre atelier intégré conçoit et fabrique des supports
              qui donnent de la lumière à votre marque.
            </p>
            <ul className="mt-8 grid grid-cols-3 gap-3">
              {[
                { value: "18", label: "Années d'expérience" },
                { value: "58", label: "Wilayas couvertes" },
                { value: "1 200+", label: "Projets livrés" },
              ].map((s) => (
                <li key={s.label} className="rounded-2xl glass-soft p-4 text-center">
                  <p className="text-2xl font-extrabold text-gradient sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-10 -z-10 opacity-80 blur-3xl"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(255,120,40,0.45), transparent 70%), radial-gradient(ellipse 70% 50% at 50% 65%, rgba(227,6,19,0.4), transparent 72%)",
                }}
              />
              <img
                src={enseigne3d.url}
                alt="Enseigne lumineuse 3D Afric Pub — Communication Globale"
                loading="lazy"
                width={1536}
                height={1024}
                className="w-full rounded-3xl object-cover shadow-[0_30px_60px_rgba(227,6,19,0.35)]"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- NOTRE PROCESSUS ---------- */}
      <section aria-labelledby="process-title" className="mx-auto mt-20 max-w-7xl">
        <Reveal>
          <h2 id="process-title" className="text-3xl font-bold sm:text-5xl">
            {t("section.process")}
          </h2>
        </Reveal>
        <div className="mt-10">
          <ProcessSteps />
        </div>
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
              <article className="group h-full overflow-hidden rounded-3xl glass card-3d p-3">
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-44 w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="p-4">
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
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
          {projects.slice(0, 3).map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 90}>
              <figure className="group relative overflow-hidden rounded-3xl glass p-2">
                <img
                  src={p.image}
                  alt={p.alt}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-64 w-full rounded-2xl object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <figcaption className="flex items-center justify-between px-3 py-4">
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="rounded-full glass-soft px-3 py-1 text-xs text-muted-foreground">
                    {p.category}
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




      {/* ---------- CTA ---------- */}
      <section className="mx-auto mt-28 max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass glow p-10 text-center sm:p-16">
            <h2 className="text-3xl font-bold sm:text-5xl">{settings?.cta_title || t("cta.title")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{settings?.cta_sub || t("cta.sub")}</p>
            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-brand px-8 py-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.04]"
            >
              {settings?.cta_label || t("cta.quote")}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
